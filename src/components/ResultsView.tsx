import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ResultsView() {
  const [sessionCode, setSessionCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("session");
    if (code) {
      setSessionCode(code);
    }
  }, []);

  const session = useQuery(
    api.sessions.getSessionByCode,
    sessionCode ? { sessionCode } : "skip"
  );

  const accessVerification = useQuery(
    api.sessions.verifyResultsAccess,
    sessionCode && (session?.resultsPublic || pinCode.length === 4) 
      ? { sessionCode, pinCode: pinCode || undefined } 
      : "skip"
  );

  const elements = useQuery(
    api.elements.getSessionElements,
    session && accessGranted ? { sessionId: session._id } : "skip"
  ) || [];

  const responses = useQuery(
    api.responses.getSessionResponses,
    session && accessGranted ? { sessionId: session._id } : "skip"
  ) || [];

  // Get custom colors with defaults
  const bgColor = session?.bgColor || "#f9fafb";
  const accentColor = session?.accentColor || "#2563eb";

  useEffect(() => {
    if (accessVerification) {
      if (accessVerification.success) {
        setAccessGranted(true);
        setPinError("");
      } else {
        setAccessGranted(false);
        if (accessVerification.error === "Pin code required") {
          setShowPinInput(true);
        } else if (accessVerification.error === "Invalid pin code") {
          setPinError("Invalid pin code. Please try again.");
        }
      }
    }
  }, [accessVerification]);

  useEffect(() => {
    if (session && session.resultsPublic) {
      setAccessGranted(true);
    } else if (session && !session.resultsPublic) {
      setShowPinInput(true);
    }
  }, [session]);

  if (!sessionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">PollUp Results</h1>
          <p className="text-gray-600">No session code provided in URL</p>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
          <p className="text-gray-600">Session code "{sessionCode}" is not valid</p>
        </div>
      </div>
    );
  }

  if (showPinInput && !accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title} - Results</h1>
            <p className="text-gray-600">This session requires a pin code to view results</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 4-digit pin code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinCode(value);
                  setPinError("");
                }}
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0000"
                maxLength={4}
              />
              {pinError && (
                <p className="mt-2 text-sm text-red-600">{pinError}</p>
              )}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">Session: {sessionCode}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalParticipants = new Set(responses.map(r => r.participantId)).size;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.title} - Results</h1>
          {session.description && (
            <p className="text-gray-600">{session.description}</p>
          )}
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span 
              className="px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: `${accentColor}20`,
                color: accentColor
              }}
            >
              Session: {sessionCode}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              {totalParticipants} Participants
            </span>
            {!session.resultsPublic && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Private Results
              </span>
            )}
          </div>
        </div>

        {elements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No elements in this session</p>
          </div>
        ) : (
          <div className="space-y-8">
            {elements.map((element) => (
              <ElementResults
                key={element._id}
                element={element}
                responses={responses.filter(r => r.elementId === element._id)}
                totalParticipants={totalParticipants}
                accentColor={accentColor}
              />
            ))}
          </div>
        )}
        
        {/* CTA Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Create Your Own Interactive Polls
            </h2>
            <p className="text-gray-600 mb-6">
              Engage your audience with real-time polls, quizzes, and surveys
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: accentColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              Get Started - Everything's 100% Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ElementResultsProps {
  element: any;
  responses: any[];
  totalParticipants: number;
  accentColor: string;
}

function ElementResults({ element, responses, totalParticipants, accentColor }: ElementResultsProps) {
  const getChoiceStats = () => {
    if (!element.choices) return {};
    
    const stats: Record<string, number> = {};
    element.choices.forEach((choice: any) => {
      stats[choice.id] = 0;
    });

    responses.forEach(response => {
      if (response.choiceIds) {
        response.choiceIds.forEach((choiceId: string) => {
          stats[choiceId] = (stats[choiceId] || 0) + 1;
        });
      }
    });

    return stats;
  };

  const getNumberStats = () => {
    const values = responses
      .map(r => r.numberValue)
      .filter(v => v !== undefined && v !== null);
    
    if (values.length === 0) return null;

    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const choiceStats = getChoiceStats();
  const numberStats = getNumberStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{element.title}</h3>
        {element.subtitle && (
          <p className="text-gray-700 mb-1">{element.subtitle}</p>
        )}
        {element.description && (
          <p className="text-gray-600 text-sm">{element.description}</p>
        )}
        <div className="mt-2 text-sm text-gray-500">
          {responses.length} of {totalParticipants} participants responded
        </div>
      </div>

      {element.imageUrl && (
        <div className="mb-6 flex justify-center">
          <img
            src={element.imageUrl}
            alt="Element image"
            className="max-w-md max-h-64 object-contain rounded-lg"
          />
        </div>
      )}

      {(element.type === "single_choice" || element.type === "single_choice_unique" || element.type === "multiple_choice") && (
        <div className="space-y-3">
          {element.choices?.map((choice: any) => {
            const count = choiceStats[choice.id] || 0;
            const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0;
            const isCorrect = choice.isCorrect || false;
            
            return (
              <div 
                key={choice.id} 
                className={`flex items-center gap-4 p-3 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-white'}`}
              >
                {choice.imageUrl && (
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={choice.imageUrl}
                      alt="Choice image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isCorrect ? 'text-green-900' : ''}`}>
                        {choice.text || "Image choice"}
                      </span>
                      {isCorrect && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                    <span className={`text-sm ${isCorrect ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: isCorrect ? '#16a34a' : accentColor
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {element.type === "number_input" && numberStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: accentColor }}>{numberStats.count}</div>
            <div className="text-sm text-gray-600">Responses</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{numberStats.average.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{numberStats.min}</div>
            <div className="text-sm text-gray-600">Minimum</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{numberStats.max}</div>
            <div className="text-sm text-gray-600">Maximum</div>
          </div>
        </div>
      )}

      {element.type === "text_input" && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {responses.filter(r => r.textValue).map((response, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">{response.textValue}</p>
            </div>
          ))}
          {responses.filter(r => r.textValue).length === 0 && (
            <p className="text-gray-500 text-sm">No text responses yet</p>
          )}
        </div>
      )}

      {element.type === "file_upload" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {responses.filter(r => r.fileUrl).map((response, index) => {
              const isImage = response.fileUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(response.fileUrl);
              
              return (
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  {isImage ? (
                    <a
                      href={response.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={response.fileUrl}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-contain group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <span 
                          className="text-xs font-medium hover:underline"
                          style={{ color: accentColor }}
                        >
                          View Full Size
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3">
                      <a
                        href={response.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-sm"
                        style={{ color: accentColor }}
                      >
                        File {index + 1}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {responses.filter(r => r.fileUrl).length === 0 && (
            <p className="text-gray-500 text-sm">No files uploaded yet</p>
          )}
        </div>
      )}
    </div>
  );
}
