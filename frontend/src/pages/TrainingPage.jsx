import React, { useState, useEffect } from 'react'
import { BookOpen, Shield, Mail, Award, Eye, Target, Lightbulb, CheckCircle, XCircle, ThumbsUp, ThumbsDown, ChevronRight, AlertTriangle, Lock, Link as LinkIcon, Paperclip } from 'lucide-react'
import { trainingService } from '../services/trainingService'

const TrainingPage = () => {
  const [activeSection, setActiveSection] = useState('spam-ham')
  const [loading, setLoading] = useState(true)
  const [trainingContent, setTrainingContent] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState({})

  useEffect(() => {
    loadTrainingContent()
  }, [])

  const loadTrainingContent = async () => {
    setLoading(true)
    try {
      const data = await trainingService.getTrainingContent()
      setTrainingContent(data)
    } catch (error) {
      console.error('Failed to load training content:', error)
      // Set default content if API fails
      setTrainingContent(getDefaultContent())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultContent = () => ({
    sections: [
      {
        id: 'spam-ham',
        title: 'Spam vs Ham Identification',
        icon: 'mail',
        order: 1,
        content: `
          <h2 class="text-2xl font-bold text-white mb-4">What is Spam vs Ham?</h2>
          <p class="text-slate-300 mb-4">Understanding the difference between spam (unwanted emails) and ham (legitimate emails) is crucial for email security.</p>
          
          <h3 class="text-xl font-semibold text-cyan-400 mb-3 mt-6">Common Spam Indicators:</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
            <li>Urgent language demanding immediate action</li>
            <li>Requests for personal or financial information</li>
            <li>Poor grammar and spelling errors</li>
            <li>Generic greetings (e.g., "Dear Customer")</li>
            <li>Suspicious sender addresses</li>
            <li>Offers that seem too good to be true</li>
          </ul>

          <h3 class="text-xl font-semibold text-green-400 mb-3">Legitimate Email Characteristics:</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>Personalized greetings with your name</li>
            <li>Professional formatting and branding</li>
            <li>Legitimate sender domain</li>
            <li>Expected communication based on your activities</li>
            <li>No pressure for immediate action</li>
          </ul>
        `,
        examples: [
          {
            id: 1,
            type: 'spam',
            subject: 'URGENT: Your account will be closed!',
            content: 'Dear Customer, Your account has been compromised. Click here immediately to verify your identity or your account will be permanently closed within 24 hours!',
            analysis: 'This is spam because it uses urgent language, generic greeting, and creates false urgency.'
          },
          {
            id: 2,
            type: 'ham',
            subject: 'Your monthly statement is ready',
            content: 'Hi John, Your bank statement for January 2024 is now available. Log in to your account to view it.',
            analysis: 'This is legitimate - personalized greeting, expected communication, no pressure tactics.'
          }
        ],
        quiz: [
          {
            id: 1,
            question: 'Congratulations! You won $1,000,000! Click here to claim your prize now!',
            correctAnswer: 'spam',
            explanation: 'This is spam - unrealistic prize, urgent call to action, likely phishing attempt.'
          },
          {
            id: 2,
            question: 'Hi Sarah, Your package from Amazon will be delivered tomorrow between 2-4 PM.',
            correctAnswer: 'ham',
            explanation: 'This appears legitimate - personalized, specific delivery information, expected notification.'
          }
        ]
      },
      {
        id: 'phishing',
        title: 'Phishing & Cyber Threats',
        icon: 'shield',
        order: 2,
        content: `
          <h2 class="text-2xl font-bold text-white mb-4">Understanding Phishing Attacks</h2>
          <p class="text-slate-300 mb-4">Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information.</p>
          
          <h3 class="text-xl font-semibold text-red-400 mb-3 mt-6">Types of Phishing:</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
            <li><strong>Email Phishing:</strong> Mass emails pretending to be from trusted sources</li>
            <li><strong>Spear Phishing:</strong> Targeted attacks on specific individuals</li>
            <li><strong>Whaling:</strong> Attacks targeting high-profile executives</li>
            <li><strong>Smishing:</strong> Phishing via SMS text messages</li>
          </ul>

          <h3 class="text-xl font-semibold text-yellow-400 mb-3">Red Flags to Watch For:</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-2">
            <li>Suspicious links (hover to check actual URL)</li>
            <li>Unexpected attachments</li>
            <li>Requests for passwords or sensitive data</li>
            <li>Mismatched sender email addresses</li>
            <li>Threatening or urgent language</li>
          </ul>
        `,
        tips: [
          {
            title: 'Verify Links',
            description: 'Hover over links before clicking. The actual URL should match the claimed destination.',
            icon: 'link'
          },
          {
            title: 'Check Attachments',
            description: 'Never open unexpected attachments, especially .exe, .zip, or .js files.',
            icon: 'paperclip'
          },
          {
            title: 'Verify Sender',
            description: 'Look closely at the sender\'s email address. Phishers often use similar-looking domains.',
            icon: 'mail'
          }
        ]
      },
      {
        id: 'best-practices',
        title: 'Email Security Best Practices',
        icon: 'award',
        order: 3,
        content: `
          <h2 class="text-2xl font-bold text-white mb-4">Protect Yourself with Best Practices</h2>
          
          <h3 class="text-xl font-semibold text-cyan-400 mb-3">Do's:</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
            <li>Use MailSentra to scan suspicious emails before interacting</li>
            <li>Enable two-factor authentication on all accounts</li>
            <li>Keep software and systems updated</li>
            <li>Verify sender identity through secondary channels</li>
            <li>Report suspicious emails to IT/Security team</li>
            <li>Use strong, unique passwords for each account</li>
          </ul>

          <h3 class="text-xl font-semibold text-red-400 mb-3">Don'ts:</h3>
          <ul class="list-disc list-inside text-slate-300 space-y-2 mb-6">
            <li>Never click on suspicious links or download unknown attachments</li>
            <li>Don't share passwords or sensitive information via email</li>
            <li>Don't trust emails based solely on appearance</li>
            <li>Don't ignore security warnings from your email client</li>
            <li>Don't use public Wi-Fi for sensitive communications</li>
          </ul>

          <h3 class="text-xl font-semibold text-green-400 mb-3">How to Report Suspicious Emails:</h3>
          <ol class="list-decimal list-inside text-slate-300 space-y-2">
            <li>Do not click any links or download attachments</li>
            <li>Use MailSentra to analyze the email</li>
            <li>If flagged as spam, provide feedback to improve the model</li>
            <li>Forward the email to your IT security team</li>
            <li>Delete the email from your inbox</li>
          </ol>
        `
      }
    ]
  })

  const getIconComponent = (iconName) => {
    const icons = {
      mail: Mail,
      shield: Shield,
      award: Award,
      link: LinkIcon,
      paperclip: Paperclip,
      target: Target,
      lock: Lock
    }
    return icons[iconName] || BookOpen
  }

  const sections = trainingContent?.sections || []
  const currentSection = sections.find(s => s.id === activeSection) || sections[0]

  const handleQuizAnswer = (quizId, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [quizId]: answer
    })
  }

  const submitQuiz = (quizId, correctAnswer) => {
    const userAnswer = quizAnswers[quizId]
    setQuizSubmitted({
      ...quizSubmitted,
      [quizId]: {
        correct: userAnswer === correctAnswer,
        answer: userAnswer
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Training Content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-grid-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                Security <span className="text-gradient">Training</span>
              </h1>
              <p className="text-slate-400 text-lg mt-1">Learn to identify and protect against email threats</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sticky top-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Training Modules</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = getIconComponent(section.icon)
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-cyan-300 border-transparent hover:border-cyan-500/30'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium text-sm text-left">{section.title}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {currentSection && (
              <>
                {/* Content Section */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 md:p-8">
                  <div 
                    className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-ul:text-slate-300 prose-li:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: currentSection.content }}
                  />
                </div>

                {/* Examples Section */}
                {currentSection.examples && currentSection.examples.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Eye className="h-6 w-6 text-cyan-400" />
                      Real Examples
                    </h3>
                    <div className="space-y-4">
                      {currentSection.examples.map((example) => (
                        <div
                          key={example.id}
                          className={`border-2 rounded-lg p-5 transition-all hover:shadow-lg ${
                            example.type === 'spam'
                              ? 'border-red-500/50 bg-red-500/5 hover:border-red-500'
                              : 'border-green-500/50 bg-green-500/5 hover:border-green-500'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              example.type === 'spam'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {example.type.toUpperCase()}
                            </span>
                            {example.type === 'spam' ? (
                              <XCircle className="h-5 w-5 text-red-400" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            )}
                          </div>
                          <p className="font-semibold text-white mb-2">Subject: {example.subject}</p>
                          <p className="text-slate-300 mb-3 text-sm bg-slate-900/50 p-3 rounded border border-slate-700/50">{example.content}</p>
                          <div className="flex items-start gap-2 text-sm bg-slate-900/30 p-3 rounded border border-slate-700/30">
                            <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-slate-400">{example.analysis}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Section */}
                {currentSection.quiz && currentSection.quiz.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Target className="h-6 w-6 text-purple-400" />
                      Test Your Knowledge
                    </h3>
                    <div className="space-y-6">
                      {currentSection.quiz.map((question, idx) => {
                        const submitted = quizSubmitted[question.id]
                        const userAnswer = quizAnswers[question.id]
                        
                        return (
                          <div key={question.id} className="border border-slate-700 rounded-lg p-5 bg-slate-900/30">
                            <p className="text-slate-300 mb-4">
                              <span className="font-bold text-white">Question {idx + 1}:</span> "{question.question}"
                            </p>
                            <div className="flex gap-3 mb-4">
                              <button
                                onClick={() => handleQuizAnswer(question.id, 'spam')}
                                disabled={submitted}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                  userAnswer === 'spam'
                                    ? submitted && userAnswer === question.correctAnswer
                                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                      : submitted
                                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                                      : 'bg-red-500/30 border-2 border-red-500 text-red-300'
                                    : 'bg-slate-800 border-2 border-slate-700 text-slate-300 hover:border-red-500/50 hover:bg-red-500/10'
                                } ${submitted ? 'cursor-not-allowed' : ''}`}
                              >
                                <ThumbsDown className="h-5 w-5" />
                                Spam
                              </button>
                              <button
                                onClick={() => handleQuizAnswer(question.id, 'ham')}
                                disabled={submitted}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                  userAnswer === 'ham'
                                    ? submitted && userAnswer === question.correctAnswer
                                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                      : submitted
                                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                                      : 'bg-green-500/30 border-2 border-green-500 text-green-300'
                                    : 'bg-slate-800 border-2 border-slate-700 text-slate-300 hover:border-green-500/50 hover:bg-green-500/10'
                                } ${submitted ? 'cursor-not-allowed' : ''}`}
                              >
                                <ThumbsUp className="h-5 w-5" />
                                Legitimate (Ham)
                              </button>
                            </div>
                            {!submitted && userAnswer && (
                              <button
                                onClick={() => submitQuiz(question.id, question.correctAnswer)}
                                className="w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50"
                              >
                                Submit Answer
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            )}
                            {submitted && (
                              <div className={`mt-4 p-4 rounded-lg border-2 ${
                                submitted.correct
                                  ? 'bg-green-500/10 border-green-500/50'
                                  : 'bg-red-500/10 border-red-500/50'
                              }`}>
                                <p className={`font-semibold mb-2 flex items-center gap-2 ${
                                  submitted.correct ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {submitted.correct ? (
                                    <>
                                      <CheckCircle className="h-5 w-5" />
                                      Correct!
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-5 w-5" />
                                      Incorrect
                                    </>
                                  )}
                                </p>
                                <p className="text-slate-300 text-sm">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Tips Section */}
                {currentSection.tips && currentSection.tips.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Lightbulb className="h-6 w-6 text-yellow-400" />
                      Quick Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentSection.tips.map((tip, idx) => {
                        const IconComponent = getIconComponent(tip.icon)
                        return (
                          <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 hover:border-cyan-500/50 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
                                <IconComponent className="h-5 w-5 text-cyan-400" />
                              </div>
                              <h4 className="font-semibold text-white">{tip.title}</h4>
                            </div>
                            <p className="text-slate-400 text-sm">{tip.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainingPage