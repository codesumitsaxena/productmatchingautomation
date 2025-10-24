import { useState } from 'react';
import { MessageSquare, Calendar, ShoppingCart, Bot, DollarSign, Workflow, Eye, Phone, Mail, Database, Zap, Play, Settings, X, ExternalLink } from 'lucide-react';

const AutomationDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('whatsapp');
  const [expandedBot, setExpandedBot] = useState(null);
  const [previewBot, setPreviewBot] = useState(null);

  const automations = {
    whatsapp: [
      {
        id: 1,
        name: 'Restaurant Chatbot',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['WhatsApp Trigger', 'AI Agent', 'Database', 'Response'],
        description: 'Automated food ordering system with menu display, order management, and payment integration.',
        cost: '₹2,500/month',
        apiCost: 'WhatsApp API: ₹800, OpenAI: ₹1,200, DB: ₹500'
      },
      {
        id: 2,
        name: 'Appointment Chatbot',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['WhatsApp Trigger', 'Calendar API', 'AI Agent', 'Confirmation'],
        description: 'Smart appointment booking system with calendar sync, reminders, and rescheduling options.',
        cost: '₹1,800/month',
        apiCost: 'WhatsApp API: ₹800, Calendar: ₹500, AI: ₹500'
      },
      {
        id: 3,
        name: 'Lead Generation Bot',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['WhatsApp Trigger', 'AI Qualifier', 'CRM Integration', 'Notification'],
        description: 'Qualify leads automatically, capture contact details, and sync with your CRM system.',
        cost: '₹2,200/month',
        apiCost: 'WhatsApp API: ₹800, AI: ₹900, CRM: ₹500'
      }
    ],
    telegram: [
      {
        id: 4,
        name: 'Customer Support Bot',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Telegram Trigger', 'AI Assistant', 'Ticket System', 'Response'],
        description: 'Handle customer queries 24/7 with AI-powered responses and automatic ticket creation.',
        cost: '₹1,500/month',
        apiCost: 'Telegram API: Free, OpenAI: ₹1,200, DB: ₹300'
      },
      {
        id: 5,
        name: 'E-commerce Assistant',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Telegram Trigger', 'Product Catalog', 'AI Agent', 'Payment Gateway'],
        description: 'Complete shopping experience with product search, recommendations, and secure checkout.',
        cost: '₹3,000/month',
        apiCost: 'Telegram API: Free, AI: ₹1,500, Payment: ₹1,500'
      },
      {
        id: 6,
        name: 'Notification Bot',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Scheduler', 'AI Generator', 'Telegram API', 'Analytics'],
        description: 'Automated notifications and updates with personalized messaging.',
        cost: '₹1,000/month',
        apiCost: 'Telegram API: Free, AI: ₹700, Storage: ₹300'
      }
    ],
    email: [
      {
        id: 7,
        name: 'Auto Reply System',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Email Trigger', 'AI Classifier', 'Response Generator', 'Send Email'],
        description: 'Intelligent email responses with sentiment analysis and automatic categorization.',
        cost: '₹1,200/month',
        apiCost: 'Email API: ₹400, OpenAI: ₹600, Storage: ₹200'
      },
      {
        id: 8,
        name: 'Newsletter Manager',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Scheduler', 'Content AI', 'Email Designer', 'Bulk Send'],
        description: 'Automated newsletter creation and distribution with personalization.',
        cost: '₹1,800/month',
        apiCost: 'Email API: ₹800, AI: ₹700, Analytics: ₹300'
      },
      {
        id: 9,
        name: 'Lead Nurture',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Email Trigger', 'Behavior Track', 'AI Segment', 'Campaign'],
        description: 'Smart lead nurturing with behavioral triggers and personalized campaigns.',
        cost: '₹2,500/month',
        apiCost: 'Email API: ₹1,000, AI: ₹1,200, CRM: ₹300'
      }
    ],
    voice: [
      {
        id: 10,
        name: 'Voice Assistant',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Call Trigger', 'Speech-to-Text', 'AI Agent', 'Text-to-Speech'],
        description: 'Voice-based customer interaction with natural language understanding.',
        cost: '₹4,500/month',
        apiCost: 'Call API: ₹2,000, STT: ₹1,200, AI: ₹1,300'
      },
      {
        id: 11,
        name: 'IVR System',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Phone Trigger', 'Menu Router', 'AI Handler', 'Call Transfer'],
        description: 'Intelligent IVR system with AI-powered routing and escalation.',
        cost: '₹3,800/month',
        apiCost: 'Phone API: ₹1,800, AI: ₹1,500, Storage: ₹500'
      },
      {
        id: 12,
        name: 'Voicemail AI',
        workflowUrl: 'https://n8n.avertisystems.com/workflow/E4tJTqLEucm1VhqY',
        nodes: ['Voicemail', 'Transcribe', 'AI Analyze', 'Notification'],
        description: 'Automated voicemail transcription, analysis, and priority alerts.',
        cost: '₹2,200/month',
        apiCost: 'Phone API: ₹800, STT: ₹1,000, AI: ₹400'
      }
    ]
  };

  const categories = [
    { id: 'whatsapp', name: 'WhatsApp AI', icon: MessageSquare, count: 3 },
    { id: 'telegram', name: 'Telegram AI', icon: MessageSquare, count: 3 },
    { id: 'email', name: 'Email AI', icon: Mail, count: 3 },
    { id: 'voice', name: 'Voice AI', icon: Phone, count: 3 }
  ];

  const currentAutomations = automations[selectedCategory] || [];
  const selectedBot = currentAutomations.find(a => a.id === expandedBot);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      <div className="w-64 bg-white shadow-xl border-r border-sky-100 flex-shrink-0">
        <div className="p-6 border-b border-sky-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            AI Automations
          </h1>
          <p className="text-sm text-slate-500 mt-1">N8N Dashboard</p>
        </div>
        
        <nav className="p-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setExpandedBot(null);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl mb-2 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200'
                    : 'hover:bg-sky-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/20' : 'bg-sky-100 text-sky-700'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              {categories.find(c => c.id === selectedCategory)?.name} Automations
            </h2>
            <p className="text-slate-600">Click on any chatbot card to view its live N8N workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentAutomations.map((auto) => (
              <div
                key={auto.id}
                onClick={() => setExpandedBot(expandedBot === auto.id ? null : auto.id)}
                className={`bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl ${
                  expandedBot === auto.id
                    ? 'border-sky-500 ring-4 ring-sky-100'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Bot className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{auto.name}</h3>
                        <p className="text-xs text-slate-500">{auto.nodes.length} nodes</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4">{auto.description}</p>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Nodes Used</p>
                    <div className="flex flex-wrap gap-2">
                      {auto.nodes.map((node, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200">
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Monthly Cost</p>
                      <p className="text-xl font-bold text-sky-600">{auto.cost}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewBot(auto);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-all text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {expandedBot && selectedBot && (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-sky-500 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <Workflow className="w-6 h-6 text-sky-400" />
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {selectedBot.name} - Workflow Editor
                    </h3>
                    <p className="text-slate-400 text-xs">Live N8N Editor • Click nodes to configure</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                    ● Active
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={selectedBot.workflowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in N8N
                  </a>
                  <button
                    onClick={() => setExpandedBot(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>

              <div className="relative bg-slate-900">
                <iframe
                  src={selectedBot.workflowUrl}
                  className="w-full h-[600px] border-0"
                  title="N8N Workflow Editor"
                  allow="fullscreen"
                />
              </div>

              <div className="bg-slate-800 px-6 py-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-slate-400">API Cost: </span>
                      <span className="text-sky-400 font-medium">{selectedBot.apiCost}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Monthly: </span>
                      <span className="text-green-400 font-bold">{selectedBot.cost}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Execute Workflow
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewBot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{previewBot.name}</h3>
                <p className="text-sky-100 text-sm">Live Chat Preview</p>
              </div>
              <button
                onClick={() => setPreviewBot(null)}
                className="px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all backdrop-blur font-medium"
              >
                Close
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-8 bg-slate-50">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-md max-w-md border border-slate-200">
                    <p className="text-sm text-slate-800">Hello! Welcome to MatchFlow Solutions! 👋</p>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl rounded-tr-none p-4 shadow-md max-w-md">
                    <p className="text-sm text-white">I need steel pipes</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-sm font-bold text-white">U</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-md max-w-md border border-slate-200">
                    <p className="text-sm text-slate-800">Great! What model or specification do you require?</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button className="bg-gradient-to-r from-sky-500 to-blue-500 hover:shadow-lg px-8 py-3 rounded-xl transition-all text-white font-semibold">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationDashboard;