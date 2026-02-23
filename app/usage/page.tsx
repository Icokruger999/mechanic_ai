"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function UsagePage() {
  const [credits, setCredits] = useState(0); // Start with 0 instead of 20
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    setIsLoading(true);
    
    try {
      const sessionId = localStorage.getItem('mechanicai_session_id');
      
      console.log('Loading usage data for session:', sessionId);
      
      if (!sessionId) {
        console.log('No session ID found');
        setIsLoading(false);
        return;
      }

      // Get current credits
      const { data: userCredit, error: creditError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('session_id', sessionId)
        .single();
      
      console.log('User credit data:', userCredit, 'Error:', creditError);
      
      if (userCredit) {
        console.log('Setting credits to:', userCredit.balance);
        setCredits(userCredit.balance);
      } else {
        console.log('No user credit found, keeping at 0');
      }

      // Get credit transactions for timeline
      const { data: transactions, error: transError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      console.log('Transactions:', transactions, 'Error:', transError);
      
      if (transactions && transactions.length > 0) {
        setChats(transactions); // Use transactions instead of chats for the graph
      } else {
        // Fallback to chats if no transactions
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select('id, title, created_at')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        
        console.log('Chats:', chatsData, 'Error:', chatsError);
        
        if (chatsData) {
          setChats(chatsData);
        }
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate based on actual starting amount (20 credits)
  const startingCredits = 20;
  
  // Calculate total allocated (starting credits + all purchases)
  const hasTransactions = chats.length > 0 && 'amount' in chats[0];
  const totalPurchases = hasTransactions 
    ? chats.filter((t: any) => t.type === 'purchase').reduce((sum: number, t: any) => sum + t.amount, 0)
    : 0;
  const totalAllocated = startingCredits + totalPurchases;
  const totalUsed = totalAllocated - credits;
  const usagePercentage = (totalUsed / totalAllocated) * 100;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0a',
      color: 'white',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link href="/chat" style={{ 
            color: 'rgba(255,255,255,0.6)', 
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            ← Back to Chat
          </Link>
          
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '300',
            margin: '20px 0 10px 0'
          }}>
            Credit Usage
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)',
            fontSize: '16px',
            margin: 0
          }}>
            Track your credit usage and history
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading usage data...</p>
          </div>
        ) : (
          <>
            {/* Credit Overview Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {/* Remaining Credits */}
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '30px',
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Remaining Credits
                </div>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: '600',
                  color: credits <= 5 ? '#fbbf24' : '#10b981'
                }}>
                  {credits}
                </div>
              </div>

              {/* Credits Used */}
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '30px',
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Credits Used
                </div>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: '600',
                  color: '#ef4444'
                }}>
                  {totalUsed}
                </div>
              </div>

              {/* Total Allocated */}
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '30px',
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Total Allocated
                </div>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.9)'
                }}>
                  {totalAllocated}
                </div>
              </div>
            </div>

            {/* Usage Bar */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '40px'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                marginBottom: '20px'
              }}>
                Usage Overview
              </div>
              
              <div style={{
                background: '#0a0a0a',
                height: '40px',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                  height: '100%',
                  width: `${usagePercentage}%`,
                  transition: 'width 0.5s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '15px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {usagePercentage > 10 && `${usagePercentage.toFixed(0)}%`}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '15px',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                <span>{totalUsed} credits used</span>
                <span>{credits} credits remaining</span>
              </div>
            </div>

            {/* Usage History */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '30px',
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                marginBottom: '20px'
              }}>
                Usage History
              </div>

              {chats.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 0',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  No activity yet. Start chatting to see your usage here.
                </div>
              ) : (
                <div style={{ height: '350px', padding: '20px' }}>
                  {(() => {
                    // Build credit history timeline from transactions
                    const chartData: { date: string; credits: number }[] = [];
                    let runningBalance = startingCredits;
                    
                    // Helper function to format date/time in user's timezone
                    const formatDateTime = (dateString: string, includeTime: boolean = false) => {
                      const date = new Date(dateString);
                      if (includeTime) {
                        return date.toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        });
                      }
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      });
                    };
                    
                    // Check if we have transaction data
                    const hasTransactions = chats[0] && 'amount' in chats[0];
                    
                    if (hasTransactions) {
                      // Add starting point (account creation)
                      const firstDate = formatDateTime(chats[0].created_at);
                      chartData.push({ date: 'Start', credits: startingCredits });
                      
                      // Process each transaction chronologically
                      chats.forEach((transaction: any, index: number) => {
                        runningBalance += transaction.amount;
                        
                        // Create label based on transaction type
                        let label = '';
                        if (transaction.type === 'purchase') {
                          label = `+${transaction.amount}`;
                        } else if (transaction.type === 'usage') {
                          label = `${transaction.amount}`; // Already negative
                        } else {
                          label = formatDateTime(transaction.created_at);
                        }
                        
                        chartData.push({ 
                          date: label,
                          credits: runningBalance 
                        });
                      });
                      
                      // Add current point if balance has changed
                      if (credits !== runningBalance) {
                        chartData.push({ date: 'Now', credits: credits });
                      }
                    } else {
                      // Fallback: Use chat data (each chat = -1 credit)
                      chartData.push({ date: 'Start', credits: startingCredits });
                      
                      chats.forEach((chat: any, index: number) => {
                        runningBalance -= 1;
                        chartData.push({ 
                          date: `Chat ${index + 1}`,
                          credits: runningBalance 
                        });
                      });
                      
                      // Add current point
                      if (credits !== runningBalance) {
                        chartData.push({ date: 'Now', credits: credits });
                      }
                    }

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="rgba(255,255,255,0.6)"
                            style={{ fontSize: '12px' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.6)"
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              background: '#1a1a1a',
                              border: '1px solid #2a2a2a',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="credits" 
                            stroke="#fbbf24" 
                            strokeWidth={3}
                            fill="url(#colorCredits)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Need More Credits */}
            <div style={{
              marginTop: '40px',
              textAlign: 'center',
              padding: '40px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <h3 style={{ 
                fontSize: '24px',
                marginBottom: '15px',
                fontWeight: '500'
              }}>
                Need More Credits?
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '25px',
                fontSize: '16px'
              }}>
                Purchase additional credits to continue using Mechanic AI
              </p>
              <Link href="/pricing">
                <button style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  View Pricing
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
