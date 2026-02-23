"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<Array<{id: string, name: string, messages: any[], timestamp: number, mode?: string}>>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [vehicle, setVehicle] = useState({ year: "", make: "", model: "" });
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [credits, setCredits] = useState(20);
  const [currentMode, setCurrentMode] = useState<"casual" | "mechanic">("casual");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showNavigation, setShowNavigation] = useState(true);
  const [showInputArea, setShowInputArea] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "casual" | "mechanic">("all");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteItems, setQuoteItems] = useState<Array<{
    id: string;
    type: 'part' | 'labor' | 'additional';
    description: string;
    quantity?: number;
    hours?: number;
    rate?: number;
    price: number;
  }>>([]);
  const [laborRate, setLaborRate] = useState(800);
  const [includeVAT, setIncludeVAT] = useState(true);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [sessionId] = useState(() => {
    // Get or create session ID from localStorage
    if (typeof window !== 'undefined') {
      let storedSessionId = localStorage.getItem('mechanicai_session_id');
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('mechanicai_session_id', storedSessionId);
      }
      return storedSessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle sidebar resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(150, Math.min(400, e.clientX));
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
    };

    if (isResizing) {
      document.body.classList.add('resizing');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Load saved chats from Supabase on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await fetch('/api/chats?sessionId=' + sessionId);
        const data = await response.json();
        
        // Update credits from API
        if (data.credits !== undefined) {
          setCredits(data.credits);
        }
        
        if (data.chats && data.chats.length > 0) {
          // Convert Supabase chats to local format
          const formattedChats = data.chats.map((chat: any) => ({
            id: chat.id,
            name: chat.title,
            messages: (chat.messages || []).map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              metadata: msg.metadata
            })),
            timestamp: new Date(chat.updated_at).getTime(),
            mode: chat.mode || "casual"
          }));
          setSavedChats(formattedChats);
          
          // Don't load old diagnostic data - it will update when user sends new messages
        }
      } catch (error) {
        console.error('Failed to load chats from Supabase:', error);
      } finally {
        setChatsLoaded(true);
      }
    };
    
    loadChats();
  }, [sessionId]);

  // Save current chat whenever messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const updatedChats = savedChats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages, timestamp: Date.now() }
          : chat
      );
      setSavedChats(updatedChats);
    }
  }, [messages, currentChatId]);

  const handleNewChat = async (mode: "casual" | "mechanic" = "casual") => {
    const chatTitle = mode === "mechanic" ? `Mechanic Mode ${savedChats.filter(c => c.mode === 'mechanic').length + 1}` : `Chat ${savedChats.filter(c => c.mode !== 'mechanic').length + 1}`;
    
    console.log('Creating new chat with mode:', mode);
    
    // Reset vehicle state for new chat
    setVehicle({ year: "", make: "", model: "" });
    
    // Create in Supabase first to get the real ID
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          title: chatTitle,
          country: 'ZA',
          currency: 'ZAR',
          mode: mode
        })
      });
      
      const result = await response.json();
      console.log('Create chat response:', result);
      
      if (result.success && result.chat) {
        const newChat = {
          id: result.chat.id,
          name: chatTitle,
          messages: [],
          timestamp: Date.now(),
          mode: mode
        };
        
        // Update state only
        const updated = [newChat, ...savedChats];
        setSavedChats(updated);
        
        setCurrentChatId(newChat.id);
        setMessages(newChat.messages);
        setCurrentMode(mode);
        
        console.log('New chat created successfully:', newChat);
      } else {
        console.error('Failed to create chat:', result);
      }
    } catch (error) {
      console.error('Failed to create chat in Supabase:', error);
    }
  };

  const handleLoadChat = (chatId: string) => {
    const chat = savedChats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setCurrentMode((chat.mode || "casual") as "casual" | "mechanic");
      
      // Extract vehicle info from loaded chat messages (only from user messages to avoid AI language)
      if (chat.messages.length > 0) {
        const userMessages = chat.messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
        let extractedVehicle = { year: "", make: "", model: "" };
        
        // Extract year
        const yearMatch = userMessages.match(/\b(19\d{2}|20\d{2})\b/);
        if (yearMatch) extractedVehicle.year = yearMatch[1];
        
        // Extract make
        const makes = ['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'VW', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Chevy', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volvo', 'Lexus', 'Porsche', 'Jaguar', 'Land Rover', 'Range Rover', 'Jeep', 'Dodge', 'Ram', 'GMC', 'Cadillac', 'Buick', 'Chrysler', 'Tesla', 'Rivian', 'Lucid', 'Mitsubishi', 'Suzuki', 'Isuzu', 'Renault', 'Peugeot', 'Citroen', 'Fiat', 'Alfa Romeo', 'Opel'];
        for (const make of makes) {
          if (userMessages.match(new RegExp(`\\b${make}\\b`, 'i'))) {
            extractedVehicle.make = make;
            break;
          }
        }
        
        // Extract model - look for alphanumeric patterns near the make
        if (extractedVehicle.make) {
          // Common model patterns: M3, 1400, Hilux, Camry, etc.
          const modelPatterns = [
            new RegExp(`${extractedVehicle.make}\\s+([A-Z]\\d+)`, 'i'), // BMW M3, A4
            new RegExp(`${extractedVehicle.make}\\s+(\\d{3,4})`, 'i'), // Nissan 1400
            new RegExp(`${extractedVehicle.make}\\s+([A-Z][a-z]{2,10})`, 'i'), // Toyota Hilux, Camry
          ];
          
          for (const pattern of modelPatterns) {
            const match = userMessages.match(pattern);
            if (match && match[1]) {
              extractedVehicle.model = match[1].trim();
              break;
            }
          }
        }
        
        setVehicle(extractedVehicle);
        
        // Load diagnostic from last message with metadata
        let foundDiagnostic = false;
        for (let i = chat.messages.length - 1; i >= 0; i--) {
          if (chat.messages[i].role === 'assistant' && chat.messages[i].metadata?.diagnostic) {
            setDiagnostic(chat.messages[i].metadata.diagnostic);
            foundDiagnostic = true;
            break;
          }
        }
        
        if (!foundDiagnostic) {
          // Don't clear diagnostic - keep the last one
        }
      } else {
        // New chat - reset vehicle but keep diagnostic
        setVehicle({ year: "", make: "", model: "" });
      }
      
      scrollToBottom();
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Delete from state
    const updated = savedChats.filter(c => c.id !== chatId);
    setSavedChats(updated);
    
    // Delete from Supabase
    try {
      await fetch(`/api/chats?chatId=${chatId}&sessionId=${sessionId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete chat from Supabase:', error);
    }
    
    if (currentChatId === chatId) {
      if (updated.length > 0) {
        setCurrentChatId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        // Don't create a new chat automatically, just clear the current state
        setCurrentChatId(null);
        setMessages([]);
      }
    }
  };

  const handleStartEdit = (chatId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (chatId: string) => {
    if (editingName.trim()) {
      const updated = savedChats.map(chat =>
        chat.id === chatId ? { ...chat, name: editingName.trim() } : chat
      );
      setSavedChats(updated);
      
      // Save to Supabase
      try {
        console.log('Saving chat rename:', { chatId, title: editingName.trim(), sessionId });
        const response = await fetch('/api/chats', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            title: editingName.trim(),
            sessionId
          })
        });
        const result = await response.json();
        console.log('Rename response:', result);
        
        if (!result.success) {
          console.error('Failed to rename chat:', result.error);
        }
      } catch (error) {
        console.error('Failed to save chat title to Supabase:', error);
      }
    }
    setEditingChatId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingName("");
  };

  // Initialize first chat if none exists (only after chats are loaded)
  useEffect(() => {
    if (!chatsLoaded) return;
    
    if (!currentChatId && savedChats.length === 0) {
      handleNewChat();
    } else if (!currentChatId && savedChats.length > 0) {
      setCurrentChatId(savedChats[0].id);
      setMessages(savedChats[0].messages);
      scrollToBottom();
    }
  }, [chatsLoaded, savedChats.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Check if user has credits
    if (credits <= 0) {
      alert('You have run out of credits. Please purchase more credits to continue.');
      return;
    }
    
    // Create a chat if one doesn't exist
    let activeChatId = currentChatId;
    if (!activeChatId) {
      const chatTitle = `Chat ${savedChats.length + 1}`;
      
      try {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            title: chatTitle,
            country: 'ZA',
            currency: 'ZAR'
          })
        });
        
        const result = await response.json();
        
        if (result.success && result.chat) {
          activeChatId = result.chat.id;
          setCurrentChatId(activeChatId);
          
          const newChat = {
            id: result.chat.id,
            name: chatTitle,
            messages: [],
            timestamp: Date.now()
          };
          
          setSavedChats([newChat, ...savedChats]);
        }
      } catch (error) {
        console.error('Failed to create chat:', error);
        return;
      }
    }
    
    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    
    // Extract vehicle info from conversation history (only from user messages)
    let extractedVehicle = { ...vehicle };
    const userText = [...updatedMessages.filter(m => m.role === 'user').map(m => m.content), input].join(' ');
    
    // Extract year (4 digits between 1900-2099)
    if (!extractedVehicle.year) {
      const yearMatch = userText.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) extractedVehicle.year = yearMatch[1];
    }
    
    // Extract common car makes
    if (!extractedVehicle.make) {
      const makes = ['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'VW', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Chevy', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volvo', 'Lexus', 'Porsche', 'Jaguar', 'Land Rover', 'Range Rover', 'Jeep', 'Dodge', 'Ram', 'GMC', 'Cadillac', 'Buick', 'Chrysler', 'Tesla', 'Rivian', 'Lucid', 'Mitsubishi', 'Suzuki', 'Isuzu', 'Renault', 'Peugeot', 'Citroen', 'Fiat', 'Alfa Romeo', 'Opel'];
      for (const make of makes) {
        if (userText.match(new RegExp(`\\b${make}\\b`, 'i'))) {
          extractedVehicle.make = make;
          break;
        }
      }
    }
    
    // Extract model - look for alphanumeric patterns near the make
    if (!extractedVehicle.model && extractedVehicle.make) {
      // Common model patterns: M3, 1400, Hilux, Camry, etc.
      const modelPatterns = [
        new RegExp(`${extractedVehicle.make}\\s+([A-Z]\\d+)`, 'i'), // BMW M3, A4
        new RegExp(`${extractedVehicle.make}\\s+(\\d{3,4})`, 'i'), // Nissan 1400
        new RegExp(`${extractedVehicle.make}\\s+([A-Z][a-z]{2,10})`, 'i'), // Toyota Hilux, Camry
      ];
      
      for (const pattern of modelPatterns) {
        const match = userText.match(pattern);
        if (match && match[1]) {
          extractedVehicle.model = match[1].trim();
          break;
        }
      }
    }
    
    // Update vehicle state if we extracted new info
    if (extractedVehicle.year || extractedVehicle.make || extractedVehicle.model) {
      setVehicle(extractedVehicle);
    }
    
    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          vehicle: extractedVehicle,
          history: messages, // Send previous messages, not including the current one
          mode: currentMode,
          sessionId: sessionId,
          chatId: activeChatId
        })
      });
      
      const data = await response.json();
      
      // Update diagnostic panel with real data
      if (data.diagnostic) {
        setDiagnostic(data.diagnostic);
      }
      
      // Update credits if returned
      if (data.credits !== undefined) {
        setCredits(data.credits);
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    }
    
    setIsLoading(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const conversationHTML = messages
      .map(msg => `
        <div class="message ${msg.role}">
          <div class="message-header">${msg.role === 'user' ? 'Customer' : 'Mechanic AI Diagnosis'}</div>
          <div class="message-content">${msg.content.replace(/\n/g, '<br>')}</div>
        </div>
      `)
      .join('');

    const reportDate = new Date().toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mechanic AI - Professional Diagnostic Report</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 900px;
              margin: 0 auto;
              padding: 40px;
              background: #fff;
              color: #333;
              line-height: 1.8;
            }
            
            .header {
              text-align: center;
              border-bottom: 4px solid #ef4444;
              padding-bottom: 30px;
              margin-bottom: 40px;
            }
            
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #0a0a0a;
              margin-bottom: 10px;
            }
            
            .subtitle {
              color: #666;
              font-size: 16px;
            }
            
            .report-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              background: #f8f9fa;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 40px;
              border-left: 4px solid #ef4444;
            }
            
            .info-item {
              margin-bottom: 10px;
            }
            
            .info-label {
              font-weight: 600;
              color: #555;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-value {
              font-size: 16px;
              color: #0a0a0a;
              margin-top: 5px;
            }
            
            .section-title {
              font-size: 22px;
              font-weight: 600;
              color: #0a0a0a;
              margin: 40px 0 20px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e5e5;
            }
            
            .message {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            
            .message-header {
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
            }
            
            .message.user .message-header {
              color: #2563eb;
            }
            
            .message.assistant .message-header {
              color: #ef4444;
            }
            
            .message-content {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #e5e5e5;
              font-size: 15px;
            }
            
            .message.user .message-content {
              border-left-color: #2563eb;
            }
            
            .message.assistant .message-content {
              border-left-color: #ef4444;
            }
            
            .disclaimer {
              margin-top: 60px;
              padding: 25px;
              background: #fff3cd;
              border: 2px solid #ffc107;
              border-radius: 8px;
              font-size: 14px;
              line-height: 1.6;
            }
            
            .disclaimer-title {
              font-weight: 600;
              color: #856404;
              margin-bottom: 10px;
              font-size: 16px;
            }
            
            .footer {
              margin-top: 60px;
              padding-top: 30px;
              border-top: 2px solid #e5e5e5;
              text-align: center;
              color: #666;
              font-size: 13px;
            }
            
            .footer-logo {
              font-weight: 600;
              color: #0a0a0a;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🔧 Mechanic AI</div>
            <div class="subtitle">Professional Vehicle Diagnostic Report</div>
          </div>
          
          <div class="report-info">
            <div>
              <div class="info-item">
                <div class="info-label">Report Date</div>
                <div class="info-value">${reportDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Report ID</div>
                <div class="info-value">#${Date.now().toString().slice(-8)}</div>
              </div>
            </div>
            <div>
              <div class="info-item">
                <div class="info-label">Vehicle</div>
                <div class="info-value">${vehicle.year ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '2024 Hyundai i20'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Diagnostic Mode</div>
                <div class="info-value">${currentMode === 'casual' ? 'Casual' : 'Professional Mechanic'}</div>
              </div>
            </div>
          </div>
          
          <div class="section-title">Diagnostic Conversation</div>
          ${conversationHTML}
          
          <div class="disclaimer">
            <div class="disclaimer-title">⚠️ Important Disclaimer</div>
            <p>This diagnostic report is generated by an AI assistant and should be used for informational purposes only. Always consult with a certified, licensed mechanic before performing any repairs or maintenance on your vehicle. The information provided may not account for all variables specific to your vehicle's condition, history, or local regulations.</p>
          </div>
          
          <div class="footer">
            <div class="footer-logo">Mechanic AI</div>
            <p>AI-Powered Vehicle Diagnostics | For Professional Use</p>
            <p>Generated on ${reportDate}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEmailClick = () => {
    setShowEmailModal(true);
  };

  const handleGenerateQuote = () => {
    // Extract parts and costs from diagnostic or conversation
    const extractedItems: Array<any> = [];
    
    // Parse the last assistant message for cost information
    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistantMsg) {
      const content = lastAssistantMsg.content;
      
      // Try to extract parts and costs from the message
      // Look for patterns like "Turbocharger: R25,000" or "Labor (6 hrs): R4,800"
      const lines = content.split('\n');
      lines.forEach((line: string) => {
        // Match part costs
        const partMatch = line.match(/[-•]\s*([^:]+):\s*R?\s*([\d,]+)/i);
        if (partMatch) {
          extractedItems.push({
            id: `item-${Date.now()}-${Math.random()}`,
            type: 'part',
            description: partMatch[1].trim(),
            price: parseInt(partMatch[2].replace(/,/g, ''))
          });
        }
        
        // Match labor with hours
        const laborMatch = line.match(/labor.*?(\d+)\s*hrs?.*?R?\s*([\d,]+)/i);
        if (laborMatch) {
          extractedItems.push({
            id: `item-${Date.now()}-${Math.random()}`,
            type: 'labor',
            description: 'Labor',
            hours: parseInt(laborMatch[1]),
            rate: laborRate,
            price: parseInt(laborMatch[2].replace(/,/g, ''))
          });
        }
      });
    }
    
    // If no items extracted, add default template
    if (extractedItems.length === 0) {
      extractedItems.push(
        {
          id: `item-${Date.now()}-1`,
          type: 'part',
          description: 'Parts & Materials',
          price: diagnostic?.costMin || 5000
        },
        {
          id: `item-${Date.now()}-2`,
          type: 'labor',
          description: 'Labor',
          hours: 4,
          rate: laborRate,
          price: 4 * laborRate
        }
      );
    }
    
    setQuoteItems(extractedItems);
    setShowQuoteModal(true);
  };

  const addQuoteItem = (type: 'part' | 'labor' | 'additional') => {
    const newItem = {
      id: `item-${Date.now()}`,
      type,
      description: type === 'part' ? 'New Part' : type === 'labor' ? 'Labor' : 'Additional Item',
      ...(type === 'labor' ? { hours: 1, rate: laborRate } : {}),
      price: type === 'labor' ? laborRate : 0
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateQuoteItem = (id: string, field: string, value: any) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate labor price if hours or rate changed
        if (item.type === 'labor' && (field === 'hours' || field === 'rate')) {
          updated.price = (updated.hours || 0) * (updated.rate || laborRate);
        }
        return updated;
      }
      return item;
    }));
  };

  const removeQuoteItem = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const calculateQuoteTotals = () => {
    const partsTotal = quoteItems.filter(i => i.type === 'part').reduce((sum, i) => sum + i.price, 0);
    const laborTotal = quoteItems.filter(i => i.type === 'labor').reduce((sum, i) => sum + i.price, 0);
    const additionalTotal = quoteItems.filter(i => i.type === 'additional').reduce((sum, i) => sum + i.price, 0);
    const subtotal = partsTotal + laborTotal + additionalTotal;
    const vat = includeVAT ? subtotal * 0.15 : 0;
    const total = subtotal + vat;
    
    return { partsTotal, laborTotal, additionalTotal, subtotal, vat, total };
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      return;
    }

    setIsSendingEmail(true);

    // Extract vehicle info from messages
    let vehicleInfo = { year: "", make: "", model: "" };
    
    // Look through messages for vehicle information
    const conversationText = messages.map(m => m.content).join(' ');
    
    // Try to extract year (4 digits between 1900-2099)
    const yearMatch = conversationText.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) vehicleInfo.year = yearMatch[1];
    
    // Try to extract common car makes
    const makes = ['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volvo', 'Lexus', 'Porsche', 'Jaguar', 'Land Rover', 'Range Rover', 'Jeep', 'Dodge', 'Ram', 'GMC', 'Cadillac', 'Buick', 'Chrysler', 'Tesla', 'Rivian', 'Lucid'];
    for (const make of makes) {
      if (conversationText.match(new RegExp(`\\b${make}\\b`, 'i'))) {
        vehicleInfo.make = make;
        break;
      }
    }
    
    // Try to extract model (look for patterns like "A4", "i20", "Camry", etc.)
    const modelMatch = conversationText.match(/\b([A-Z]\d+|[A-Z][a-z]+\s?\d*)\b/);
    if (modelMatch && vehicleInfo.make) {
      // Get text near the make to find the model
      const makeIndex = conversationText.indexOf(vehicleInfo.make);
      const nearMake = conversationText.substring(makeIndex, makeIndex + 50);
      const nearModelMatch = nearMake.match(/\b([A-Z]\d+|[A-Z][a-z]+\s?\d*)\b/);
      if (nearModelMatch) vehicleInfo.model = nearModelMatch[1];
    }
    
    // If still no vehicle info, use the vehicle state or chat title
    if (!vehicleInfo.year && !vehicleInfo.make && !vehicleInfo.model) {
      if (vehicle.year) {
        vehicleInfo = vehicle;
      } else {
        const currentChat = savedChats.find(c => c.id === currentChatId);
        vehicleInfo.make = currentChat?.name || 'Vehicle';
      }
    }

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailAddress.toLowerCase().trim(),
          messages: messages,
          vehicle: vehicleInfo,
          mode: currentMode
        })
      });

      if (response.ok) {
        setShowEmailModal(false);
        setEmailAddress('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    setIsSendingEmail(false);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: `${sidebarWidth}px` }}>
        <div className="sidebar-header">
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '300', marginBottom: '0.25rem' }}>
            Mechanic <span style={{ 
              background: 'linear-gradient(135deg, #ef5350 0%, #d32f2f 50%, #b71c1c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Virtual Car Diagnostics</p>
        </div>
        
        <div className="new-chat-section">
          <button className="new-chat-button" onClick={() => handleNewChat(currentMode)}>+ New Chat</button>
        </div>
        
        <div className="sidebar-content">
          <div className="recent-chats-section">
            <div className="recent-chats-label">Recent Chats</div>
            {savedChats.filter(chat => {
              if (filterMode === "all") return true;
              if (filterMode === "casual") return chat.mode !== "mechanic";
              if (filterMode === "mechanic") return chat.mode === "mechanic";
              return true;
            }).length === 0 ? (
              <div className="chat-item">
                <span className="chat-item-name">No {filterMode === "all" ? "" : filterMode} conversations yet</span>
              </div>
            ) : (
              savedChats.filter(chat => {
                if (filterMode === "all") return true;
                if (filterMode === "casual") return chat.mode !== "mechanic";
                if (filterMode === "mechanic") return chat.mode === "mechanic";
                return true;
              }).map(chat => (
                <div 
                  key={chat.id} 
                  className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => editingChatId !== chat.id && handleLoadChat(chat.id)}
                >
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(chat.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={() => handleSaveEdit(chat.id)}
                      className="chat-name-input"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="chat-item-name">{chat.name}</span>
                      <div className="chat-item-actions">
                        <button 
                          className="edit-chat-btn"
                          onClick={(e) => handleStartEdit(chat.id, chat.name, e)}
                          title="Rename chat"
                        >
                          ✎
                        </button>
                        <button 
                          className="delete-chat-btn"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          title="Delete chat"
                        >
                          ×
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button 
            className={`footer-button ${filterMode === "casual" ? "active" : ""}`}
            onClick={() => {
              setFilterMode("casual");
              setCurrentMode("casual");
            }}
            title="Show casual chats (1 credit per message)"
          >
            Casual Mode
          </button>
          <button 
            className={`footer-button ${filterMode === "mechanic" ? "active" : ""}`}
            onClick={() => {
              setFilterMode("mechanic");
              setCurrentMode("mechanic");
            }}
            title="Show mechanic chats (2 credits per message)"
          >
            Mechanic Mode
          </button>
          <Link href="/pricing" className="footer-button">View Pricing</Link>
          <Link href="/feedback" className="footer-button">Feedback</Link>
          <Link href="/usage" className="footer-button">Usage</Link>
          <Link href="/" className="footer-button">Logout</Link>
        </div>
        
        {/* Resize Handle */}
        <div 
          className="sidebar-resize-handle"
          onMouseDown={() => setIsResizing(true)}
        />
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area">
        {/* Messages Area */}
        <div className="messages-section">
          <div className="messages-container">
            {/* Title */}
            {messages.length === 0 && (
              <div className="chat-title-section">
                <h1 className="chat-title">Mechanic AI</h1>
                <p className="chat-subtitle">Your AI-powered vehicle diagnostics</p>
              </div>
            )}
            
            {messages.map((msg, idx) => {
              // Extract section headers from this message for navigation
              const sections: Array<{title: string, id: string}> = [];
              if (msg.role === 'assistant') {
                msg.content.split('\n').forEach((line: string, lineIdx: number) => {
                  const isSectionHeader = /^[A-Z\s]+:$/.test(line.trim());
                  if (isSectionHeader) {
                    const sectionId = `msg-${idx}-section-${lineIdx}`;
                    sections.push({
                      title: line.trim(),
                      id: sectionId
                    });
                  }
                });
              }
              
              return (
                <div key={idx} className={`message-wrapper ${msg.role}`}>
                  <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: msg.role === 'user' ? 'flex-end' : 'center' }}>
                    {/* Quick Navigation Index - Left Side */}
                    {sections.length > 0 && msg.role === 'assistant' && showNavigation && (
                      <div style={{
                        background: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '6px',
                        padding: '12px',
                        minWidth: '220px',
                        maxWidth: '220px',
                        alignSelf: 'flex-start',
                        position: 'sticky',
                        top: '20px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}>
                          <div style={{
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Jump to Section
                          </div>
                          <button
                            onClick={() => setShowNavigation(false)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '18px',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              lineHeight: '1',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(211, 47, 47, 0.2)';
                              e.currentTarget.style.color = '#ef5350';
                              e.currentTarget.style.borderColor = '#ef5350';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            title="Hide navigation"
                          >
                            ×
                          </button>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0'
                        }}>
                          {sections.map((section, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                const element = document.getElementById(section.id);
                                setActiveSection(section.id);
                                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                // Clear highlight after 3 seconds
                                setTimeout(() => setActiveSection(null), 3000);
                              }}
                              style={{
                                width: '100%',
                                background: '#2a2a2a',
                                color: 'rgba(255, 255, 255, 0.7)',
                                border: 'none',
                                borderBottom: sIdx < sections.length - 1 ? '1px solid #1a1a1a' : 'none',
                                padding: '10px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                fontWeight: '400'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#3a3a3a';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#2a2a2a';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                              }}
                            >
                              {section.title.replace(':', '')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div className={`message ${msg.role}`} style={{ position: 'relative' }}>
                      {(() => {
                        const lines = msg.content.split('\n');
                        
                        // Check if message has any section headers
                        const hasSections = lines.some((line: string) => /^[A-Z\s]+:$/.test(line.trim()));
                        
                        // If no sections, render normally
                        if (!hasSections) {
                          return lines.map((line, i) => (
                            <span key={i}>
                              {line}
                              {i < lines.length - 1 && <br />}
                            </span>
                          ));
                        }
                        
                        // If has sections, render with blocks
                        const elements: JSX.Element[] = [];
                        let currentSection: string | null = null;
                        let currentSectionId: string | null = null;
                        let sectionContent: string[] = [];
                        
                        lines.forEach((line, i) => {
                          const isSectionHeader = /^[A-Z\s]+:$/.test(line.trim());
                          const sectionId = `msg-${idx}-section-${i}`;
                          const isActive = activeSection === sectionId;
                          
                          if (isSectionHeader) {
                            // Render previous section content if exists
                            if (currentSection && sectionContent.length > 0) {
                              elements.push(
                                <div key={`section-content-${currentSectionId}`} style={{
                                  background: '#1a1a1a',
                                  border: '1px solid #3a3a3a',
                                  borderRadius: '6px',
                                  padding: '15px',
                                  marginBottom: '1.5rem',
                                  lineHeight: '1.7'
                                }}>
                                  {sectionContent.map((contentLine, idx) => (
                                    <span key={idx}>
                                      {contentLine}
                                      {idx < sectionContent.length - 1 && <br />}
                                    </span>
                                  ))}
                                </div>
                              );
                              sectionContent = [];
                            }
                            
                            // Render section header
                            currentSection = line.trim();
                            currentSectionId = sectionId;
                            elements.push(
                              <div 
                                key={sectionId}
                                id={sectionId}
                                style={{ 
                                  background: 'linear-gradient(135deg, #ef5350 0%, #d32f2f 50%, #b71c1c 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text',
                                  fontWeight: '600', 
                                  fontSize: '0.95rem',
                                  marginTop: elements.length > 0 ? '1.5rem' : '0',
                                  marginBottom: '0.75rem',
                                  letterSpacing: '0.05em',
                                  scrollMarginTop: '100px',
                                  position: 'relative',
                                  paddingLeft: isActive ? '30px' : '0',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                {isActive && (
                                  <span style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '20px',
                                    color: '#fbbf24',
                                    animation: 'pulse 1.5s ease-in-out infinite'
                                  }}>
                                    →
                                  </span>
                                )}
                                {line}
                              </div>
                            );
                          } else if (line.trim() !== '') {
                            // Add content to current section
                            sectionContent.push(line);
                          } else if (currentSection) {
                            // Empty line within a section
                            sectionContent.push('');
                          } else {
                            // Content before any section header
                            elements.push(
                              <span key={`line-${i}`}>
                                {line}
                                <br />
                              </span>
                            );
                          }
                        });
                        
                        // Render last section content if exists
                        if (currentSection && sectionContent.length > 0) {
                          elements.push(
                            <div key={`section-content-${currentSectionId}-last`} style={{
                              background: '#1a1a1a',
                              border: '1px solid #3a3a3a',
                              borderRadius: '6px',
                              padding: '15px',
                              marginBottom: '0.5rem',
                              lineHeight: '1.7'
                            }}>
                              {sectionContent.map((contentLine, idx) => (
                                <span key={idx}>
                                  {contentLine}
                                  {idx < sectionContent.length - 1 && <br />}
                                </span>
                              ))}
                            </div>
                          );
                        }
                        
                        return elements;
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message assistant">Analyzing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="input-area" style={{ 
          height: showInputArea ? 'auto' : '40px',
          minHeight: showInputArea ? '120px' : '40px',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          {!showInputArea ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '40px',
              cursor: 'pointer',
              background: 'var(--surface-elevated)',
              borderTop: '1px solid var(--border-color)',
              position: 'relative'
            }}
            onClick={() => setShowInputArea(true)}
            >
              <button style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                position: 'absolute',
                top: '-10px'
              }}>
                ▲
              </button>
            </div>
          ) : (
            <>
          <div className="input-container">
            {/* Credits and Action Buttons Row */}
            <div className="input-top-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {!showNavigation && currentMode === "mechanic" && (
                  <button 
                    onClick={() => setShowNavigation(true)} 
                    className="action-btn"
                    title="Show navigation"
                  >
                    ☰ Navigation
                  </button>
                )}
                <button 
                  onClick={() => setShowInputArea(false)} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px 10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }}
                  title="Minimize input area"
                >
                  ▼
                </button>
              </div>
              <div className="action-buttons-section">
                {messages.length > 0 && (
                  <>
                    <button onClick={handlePrint} className="action-btn" title="Print Report">
                      Print
                    </button>
                    <button onClick={handleEmailClick} className="action-btn" title="Email Report">
                      Email
                    </button>
                  </>
                )}
                <div className="credits-display">
                  <span className="credits-text" style={{ 
                    color: credits <= 0 ? '#d32f2f' : credits <= 5 ? '#fbbf24' : '#10b981',
                    textShadow: credits <= 0 ? '0 0 10px rgba(211, 47, 47, 0.5)' : 'none'
                  }}>
                    Credits: {credits}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="input-wrapper">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={credits <= 0 ? "Out of credits. Please purchase more to continue." : currentMode === "mechanic" ? "Describe the issue for detailed professional analysis..." : "Ask me anything about your vehicle..."}
                className="chat-textarea"
                rows={3}
                disabled={credits <= 0}
              />
              <button onClick={handleSend} className="send-button" disabled={isLoading || credits <= 0}>
                {credits <= 0 ? '✗ No Credits' : '→ Send'}
              </button>
            </div>
          </div>
          </>
          )}
        </div>
      </main>
      {/* Right Panel - Visual Diagnostic */}
      <aside className="diagnostic-panel-right">
        {diagnostic ? (
          <div className="diagnostic-content">
            <div className="diagnostic-row">
              <span className="component-name">{diagnostic.component}</span>
              <span className={`severity-badge ${diagnostic.status.toLowerCase()}`}>{diagnostic.status}</span>
            </div>
            
            <div className="diagnostic-row">
              <span className="info-label">Estimated Repair Cost</span>
              <span className="info-value">R{diagnostic.costMin.toLocaleString()} - R{diagnostic.costMax.toLocaleString()}</span>
            </div>
            
            <div className="diagnostic-section">
              <div className="section-title">What I'll Check:</div>
              <ul className="check-list">
                {diagnostic.checks.map((check: string, idx: number) => (
                  <li key={idx}>{check}</li>
                ))}
              </ul>
            </div>
            
            <div className="parts-grid">
              {diagnostic.relatedParts.map((part: any, idx: number) => (
                <div 
                  key={idx} 
                  className="part-row"
                  onClick={() => {
                    // Build clean vehicle description
                    const vehicleDesc = [vehicle.year, vehicle.make, vehicle.model]
                      .filter(v => v && v.trim())
                      .join(' ');
                    
                    // Pre-fill input with component-specific question
                    const componentQuestion = vehicleDesc 
                      ? `I'm having issues with my ${vehicleDesc} ${part.name.toLowerCase()}. What should I check?`
                      : `I'm having issues with my ${part.name.toLowerCase()}. What should I check?`;
                    
                    setInput(componentQuestion);
                    // Focus the textarea
                    document.querySelector('.chat-textarea')?.focus();
                  }}
                  title={`Click to ask about ${part.name}`}
                >
                  <span>{part.name}</span>
                  <span className={`status-${part.status === 'Good' ? 'ok' : part.status === 'Check' ? 'warn' : 'bad'}`}>
                    {part.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="diagnostic-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px', fontWeight: '500' }}>Diagnostic Panel</h3>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', maxWidth: '250px' }}>
              Start a conversation to see detailed diagnostic information, cost estimates, and component status
            </p>
            <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>
                Ask about any car issue to get started
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Email Diagnostic Report</h2>
            <p className="modal-description">Enter your email address to receive the full diagnostic report</p>
            
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="your.email@example.com"
              className="modal-input"
              disabled={isSendingEmail}
            />
            
            <div className="modal-buttons">
              <button 
                onClick={() => setShowEmailModal(false)} 
                className="modal-btn-cancel"
                disabled={isSendingEmail}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail} 
                className="modal-btn-send"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

