
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Home, Sparkles, Filter, Trash2, ArrowLeft, Check, Tag, Anchor, X, Star, Share2, ShoppingCart, Clock, ArrowRight, Truck, MapPin, Phone, User, CreditCard, Wallet, Smartphone, Heart, Settings, Package, ChevronRight, Mail, Ruler, Bell, Moon, Shield, LogOut, HelpCircle, Info, Lock, Eye, EyeOff, Camera, MessageSquare, Headphones, Send, ShieldCheck, AlertCircle, Flame, Timer } from 'lucide-react';
import { MOCK_PRODUCTS, ORIGINS, COLORS, MAX_PRICE_LIMIT, getFutureDate } from './constants';
import { Product, CartItem, FilterState, ViewState, Coupon, DeliveryDetails, Order, UserProfile, ChatMessage } from './types';
import ProductCard from './components/ProductCard';
import FilterModal from './components/FilterModal';
import { searchProductsWithAI, searchProductsWithImage, getRecommendationsWithAI, createSupportChatSession } from './services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

const App: React.FC = () => {
  // State
  const [view, setViewInternal] = useState<ViewState>('HOME');
  const [animClass, setAnimClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // User Account State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // 2FA State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // --- PASTE YOUR USER PHOTO BASE64 STRING BELOW ---
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    clothingSize: 'M',
    shoeSize: '9',
    avatarUrl: undefined 
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeProfileTab, setActiveProfileTab] = useState<'DETAILS' | 'ORDERS'>('DETAILS');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Support Chat State
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isHumanAgent, setIsHumanAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Swipe detection refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const mainTabs: ViewState[] = ['HOME', 'WISHLIST', 'CART', 'PROFILE'];

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchCameraRef = useRef<HTMLInputElement>(null);

  // App Settings State - Dark Mode ON by default
  const [settings, setSettings] = useState({
      notifications: true,
      promoEmails: false,
      darkMode: true 
  });

  // Personalization & Coupon State
  const [purchaseHistory, setPurchaseHistory] = useState<Product[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  
  // Checkout & Delivery State
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    deliveryMethod: 'Standard',
    paymentMethod: 'Credit Card'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Product Details State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Recommendations state
  const [recommendedProductIds, setRecommendedProductIds] = useState<string[]>([]);
  const [recommendationReason, setRecommendationReason] = useState<string>('');

  // Filtering State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: MAX_PRICE_LIMIT,
    origins: [],
    colors: []
  });

  // Search Results State (for AI override)
  const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);
  
  // Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 59 });

  // --- Effects ---

  // Handle Dark Mode Toggle
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Handle Toast Timeout
  useEffect(() => {
      if (toast) {
          const timer = setTimeout(() => setToast(null), 6000); // 6 seconds to read code
          return () => clearTimeout(timer);
      }
  }, [toast]);

  // Flash Sale Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
            if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
            if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
            return prev;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-fill delivery details when entering checkout if profile exists
  useEffect(() => {
    if (view === 'CHECKOUT' && userProfile.name && !deliveryDetails.fullName) {
        setDeliveryDetails(prev => ({
            ...prev,
            fullName: userProfile.name,
            phone: userProfile.phone
        }));
    }
  }, [view, userProfile, deliveryDetails.fullName]);

  // Initialize Chat when entering Support View
  useEffect(() => {
    if (view === 'SUPPORT' && !chatSession) {
        const chat = createSupportChatSession(userProfile, orders);
        setChatSession(chat);
        // Add initial greeting
        setChatMessages([{
            id: 'init',
            role: 'model',
            text: `Hi ${userProfile.name ? userProfile.name.split(' ')[0] : 'there'}! I'm your HarbourMart concierge. How can I help you with your orders or account today?`,
            timestamp: new Date()
        }]);
    }
  }, [view, chatSession, userProfile, orders]);

  // Auto-scroll chat
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- Custom Navigation with Animation ---
  const setView = (newView: ViewState) => {
    if (view === newView) return;
    
    const tabs: ViewState[] = ['HOME', 'WISHLIST', 'CART', 'PROFILE'];
    const oldIdx = tabs.indexOf(view);
    const newIdx = tabs.indexOf(newView);
    
    let animation = 'animate-in fade-in duration-300 ease-out ';
    
    if (oldIdx !== -1 && newIdx !== -1) {
        // Between tabs
        animation += newIdx > oldIdx ? 'slide-in-from-right-10' : 'slide-in-from-left-10';
    } else if (newIdx === -1 && oldIdx !== -1) {
        // Tab to Detail
        animation += 'slide-in-from-right-16';
    } else if (newIdx !== -1 && oldIdx === -1) {
        // Detail to Tab
        animation += 'slide-in-from-left-16';
    } else {
        // Detail to Detail
        animation += 'fade-in zoom-in-95';
    }
    
    setAnimClass(animation);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setViewInternal(newView);
  };

  // --- Derived State (Logic) ---

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return cartSubtotal * appliedCoupon.discount;
  }, [cartSubtotal, appliedCoupon]);

  const deliveryFee = useMemo(() => {
    return deliveryDetails.deliveryMethod === 'Express' ? 14.99 : 0;
  }, [deliveryDetails.deliveryMethod]);

  const cartTotal = cartSubtotal - discountAmount;
  const finalTotal = cartTotal + deliveryFee;

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS]; 

    const isSearching = !!searchQuery.trim() || !!aiSearchResults;

    // Filter out sold out items if NOT searching
    if (!isSearching) {
        result = result.filter(p => p.stockStatus !== 'Sold Out');
    }

    if (aiSearchResults) {
      result = result.filter(p => aiSearchResults.includes(p.id));
      // Sort specifically by the order AI returned them in
      result.sort((a, b) => aiSearchResults.indexOf(a.id) - aiSearchResults.indexOf(b.id));
    } 
    else if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        p.category.toLowerCase().includes(lowerQuery)
      );
    }
    else if (selectedCategory !== 'All') {
        result = result.filter(p => p.category === selectedCategory);
    }

    result = result.filter(p => 
      p.price >= filters.minPrice && 
      p.price <= filters.maxPrice
    );

    if (filters.origins.length > 0) {
      result = result.filter(p => filters.origins.includes(p.origin));
    }

    if (filters.colors.length > 0) {
      result = result.filter(p => filters.colors.includes(p.color));
    }

    if (purchaseHistory.length > 0 && !aiSearchResults) {
        const tagFreq: Record<string, number> = {};
        
        purchaseHistory.forEach(p => {
            p.tags.forEach(tag => {
                const lowerTag = tag.toLowerCase();
                tagFreq[lowerTag] = (tagFreq[lowerTag] || 0) + 1;
            });
            tagFreq[p.category.toLowerCase()] = (tagFreq[p.category.toLowerCase()] || 0) + 3;
            tagFreq[p.color.toLowerCase()] = (tagFreq[p.color.toLowerCase()] || 0) + 1;
        });

        result.sort((a, b) => {
            const getScore = (p: Product) => {
                let score = 0;
                p.tags.forEach(t => score += (tagFreq[t.toLowerCase()] || 0));
                score += (tagFreq[p.category.toLowerCase()] || 0);
                score += (tagFreq[p.color.toLowerCase()] || 0);
                return score;
            };
            return getScore(b) - getScore(a);
        });
    }

    return result;
  }, [searchQuery, aiSearchResults, filters, selectedCategory, purchaseHistory]);

  // --- Handlers ---

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToast({ message, type });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    // Only allow swipe navigation on main tabs
    if (!mainTabs.includes(view)) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Must be a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 70) {
      const currentIndex = mainTabs.indexOf(view);
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe Right -> Go to previous tab
        setView(mainTabs[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < mainTabs.length - 1) {
        // Swipe Left -> Go to next tab
        setView(mainTabs[currentIndex + 1]);
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('PRODUCT_DETAILS');
    window.scrollTo(0,0);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => {
            if (item.id === product.id) {
                // Logic: If adding the same item but with a better price (e.g. from flash sale),
                // update the cart item to the lower price.
                const lowestPrice = Math.min(item.price, product.price);
                const originalPrice = product.originalPrice || item.originalPrice;
                return { 
                    ...item, 
                    quantity: item.quantity + 1,
                    price: lowestPrice,
                    originalPrice: originalPrice
                };
            }
            return item;
        });
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (product.originalPrice && product.price < product.originalPrice) {
        showToast("Flash deal added to cart!", "success");
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
        const exists = prev.find(p => p.id === product.id);
        if (exists) {
            return prev.filter(p => p.id !== product.id);
        }
        return [...prev, product];
    });
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const found = coupons.find(c => c.code === couponInput.toUpperCase().trim());
    if (found) {
        if (found.isUsed) {
            showToast("This coupon has already been used.", "error");
            return;
        }
        setAppliedCoupon(found);
        setCouponInput('');
        showToast("Coupon applied successfully!", "success");
    } else {
        showToast("Invalid or expired coupon code.", "error");
    }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
  };

  const handleSearch = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
        setAiSearchResults(null);
        return;
    }
  };

  const triggerAISearch = async () => {
    // If we're already loading, do nothing
    if (aiLoading) return;
    
    setAiLoading(true);
    setAiSearchResults(null);
    
    // Call AI service - now handles empty strings for "Discovery Mode"
    const ids = await searchProductsWithAI(searchQuery, MOCK_PRODUCTS);
    
    setAiSearchResults(ids);
    setAiLoading(false);
  };

  const triggerImageSearch = () => {
      searchCameraRef.current?.click();
  };

  const handleImageUploadSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset
      setSearchQuery('');
      setAiLoading(true);
      setAiSearchResults(null);
      e.target.value = ''; // Reset input so same file can be selected again

      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          const ids = await searchProductsWithImage(base64, MOCK_PRODUCTS);
          setAiSearchResults(ids);
          setAiLoading(false);
          showToast(`Found ${ids.length} visual matches!`, 'success');
      };
      reader.readAsDataURL(file);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setAiSearchResults(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const validateCheckout = () => {
    const errors: Record<string, string> = {};
    if (!deliveryDetails.fullName.trim()) errors.fullName = "Full Name is required";
    if (!deliveryDetails.phone.trim()) errors.phone = "Phone is required";
    if (!deliveryDetails.address.trim()) errors.address = "Address is required";
    if (!deliveryDetails.city.trim()) errors.city = "City is required";
    if (!deliveryDetails.zipCode.trim()) errors.zipCode = "Zip Code is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateCheckout()) return;
    if (appliedCoupon) {
        setCoupons(prev => prev.map(c => 
            c.code === appliedCoupon.code ? { ...c, isUsed: true } : c
        ));
    }
    const purchasedItems = [...cart];
    const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: purchasedItems,
        total: finalTotal,
        status: 'Processing',
        deliveryAddress: `${deliveryDetails.address}, ${deliveryDetails.city}`
    };
    setOrders(prev => [newOrder, ...prev]);
    setPurchaseHistory(prev => [...prev, ...purchasedItems]);
    if (!userProfile.name) {
        setUserProfile(prev => ({ ...prev, name: deliveryDetails.fullName, phone: deliveryDetails.phone }));
    }
    setCart([]);
    setAppliedCoupon(null);
    setDeliveryDetails({ fullName: '', address: '', city: '', zipCode: '', phone: '', deliveryMethod: 'Standard', paymentMethod: 'Credit Card' });
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomCode = Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const newCoupon: Coupon = { code: randomCode, discount: 0.15, description: '15% off your next shipment!', isUsed: false };
    setCoupons(prev => [...prev, newCoupon]);
    setView('SUCCESS');
    setAiLoading(true);
    const { productIds, reason } = await getRecommendationsWithAI(purchasedItems, MOCK_PRODUCTS);
    setRecommendedProductIds(productIds);
    setRecommendationReason(reason);
    setAiLoading(false);
  };

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setView('TRACK_ORDER');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const toggleSetting = (key: keyof typeof settings) => {
    if (key === 'promoEmails' && !isAuthenticated) return;
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) return;
    if (authMode === 'SIGNUP' && !authForm.name) return;
    
    const loadingBtn = document.getElementById('auth-btn');
    if (loadingBtn) loadingBtn.innerText = 'Sending Code...';
    
    // Simulate API call to send 2FA
    setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(code);
        setIsVerifying(true);
        // SIMULATE SENDING EMAIL/SMS VIA TOAST
        showToast(`HarbourMart Security: Your code is ${code}`, 'success');
        
        if (loadingBtn) loadingBtn.innerText = authMode === 'LOGIN' ? 'Sign In' : 'Create Account';
    }, 1500);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
      e.preventDefault();
      if (inputCode === verificationCode) {
          setIsAuthenticated(true);
          setIsVerifying(false);
          setInputCode('');
          setVerificationCode('');
          showToast(`Welcome back, ${authForm.name || 'User'}!`, 'success');
          
          if (authMode === 'SIGNUP') {
              setUserProfile(prev => ({ ...prev, name: authForm.name, email: authForm.email }));
          } else {
               setUserProfile(prev => ({ ...prev, email: authForm.email, name: prev.name || 'Harbour Member' }));
          }
          setAuthForm({ name: '', email: '', password: '' });
      } else {
          showToast("Invalid Verification Code. Please try again.", "error");
      }
  };

  const resendCode = () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      showToast(`HarbourMart Security: Your code is ${code}`, 'success');
  };

  const handleSignOut = () => {
      setIsAuthenticated(false);
      setIsVerifying(false);
      setVerificationCode('');
      setInputCode('');
      setUserProfile({ name: '', email: '', phone: '', clothingSize: 'M', shoeSize: '9', avatarUrl: undefined });
      setOrders([]);
      setPurchaseHistory([]);
      setWishlist([]);
      setCoupons([]);
      setCart([]);
      setChatSession(null);
      setChatMessages([]);
      setView('HOME');
      showToast("Signed out successfully.");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          setUserProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: chatInput,
        timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    if (isHumanAgent) {
        // Mock human response
        setChatMessages(prev => [...prev, { id: 'typing', role: 'model', text: '...', timestamp: new Date(), isTyping: true }]);
        setTimeout(() => {
            setChatMessages(prev => prev.filter(m => m.id !== 'typing').concat({
                id: Date.now().toString(),
                role: 'model',
                text: "Thanks for the details. I've processed your request. Is there anything else I can help you with?",
                timestamp: new Date()
            }));
        }, 2000);
    } else {
        // AI Response stream
        try {
            setChatMessages(prev => [...prev, { id: 'typing', role: 'model', text: '...', timestamp: new Date(), isTyping: true }]);
            
            let streamResponse = await chatSession.sendMessageStream({ message: userMsg.text });
            let fullText = "";
            let isFirstChunk = true;

            for await (const chunk of streamResponse) {
                const c = chunk as GenerateContentResponse;
                const text = c.text;
                if (text) {
                    fullText += text;
                    setChatMessages(prev => {
                        const filtered = isFirstChunk ? prev.filter(m => m.id !== 'typing') : prev;
                        if (isFirstChunk) {
                            return [...filtered, { id: 'ai-response', role: 'model', text: fullText, timestamp: new Date() }];
                        } else {
                             return filtered.map(m => m.id === 'ai-response' ? { ...m, text: fullText } : m);
                        }
                    });
                    isFirstChunk = false;
                }
            }
             // Finalize the ID so next message doesn't overwrite
             setChatMessages(prev => prev.map(m => m.id === 'ai-response' ? { ...m, id: Date.now().toString() } : m));

        } catch (error) {
            console.error(error);
             setChatMessages(prev => prev.filter(m => m.id !== 'typing').concat({
                id: 'error',
                role: 'system',
                text: "Sorry, I'm having trouble connecting right now. Please try again.",
                timestamp: new Date()
            }));
        }
    }
  };

  const switchToHuman = () => {
      setIsHumanAgent(true);
      setChatMessages(prev => [...prev, {
          id: 'system-switch',
          role: 'system',
          text: "Connecting you to a human agent... You are now chatting with Sarah.",
          timestamp: new Date()
      }]);
  };

  // --- Render Helpers ---

  const HarbourLogo = () => (
    <div className="w-12 h-12 relative flex items-center justify-center rounded-lg overflow-hidden shrink-0 bg-white dark:bg-slate-800 shadow-md border border-gray-100 dark:border-slate-700">
        <img 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiI+CiAgPHBhdGggZD0iTTUwIDUgQzI1IDUgNSAyNSA1IDUwIEM1IDc1IDI1IDk1IDUwIDk1IEM3NSA5NSA5NSA3NSA5NSA1MCBDOTUgMjUgNzUgNSA1MCA1IFogTTUwIDE1IEM2OSAxNSA4NSAzMSA4NSA1MCBDODUgNjkgNjkgODUgNTAgODUgQzMxIDg1IDE1IDY5IDE1IDUwIEMxNSAzMSAzMSAxNSA1MCAxNSBaIiBvcGFjaXR5PSIwLjEiIGZpbGw9IiMyNTYzZWIiIC8+CiAgPHBhdGggZD0iTTUwIDIwIEw1MCA2NSBNMzUgNDUgTDM1IDUwIEMzNSA1OCA0MiA2NSA1MCA2NSBDNTggNjUgNjUgNTggNjUgNTAgTDY1IDQ1IE0zMCA0NSBMNDAgNDUgTTYwIDQ1IEw3MCA0NSBNNDUgNzUgTDU1IDc1IEM1NSA4MCA1MCA4NSA1MCA4NSBDNTAgODUgNDUgODAgNDUgNzUgWiIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KPC9zdmc+"
            alt="HarbourMart Logo" 
            className="w-full h-full object-cover" 
        />
    </div>
  );

  const renderFlashSales = () => {
      // Pick 4 random items for Flash Sale
      const flashItems = MOCK_PRODUCTS.slice(4, 8);
      
      return (
          <div className="mb-8 mt-4 pl-4">
              <div className="flex items-center justify-between pr-4 mb-3">
                  <div className="flex items-center gap-2">
                      <div className="bg-red-500 p-1.5 rounded-lg text-white animate-pulse">
                          <Flame size={16} fill="currentColor" />
                      </div>
                      <h2 className="font-bold text-lg dark:text-white tracking-tight">Flash Deals</h2>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-full text-xs font-mono font-bold">
                      <Timer size={12} />
                      <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
              </div>
              
              <div 
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pr-4"
                  onTouchStart={(e) => e.stopPropagation()} 
                  onTouchEnd={(e) => e.stopPropagation()}
              >
                  {flashItems.map(item => {
                      // Apply 30% discount logic here
                      const discountPrice = item.price * 0.7;
                      const discountedItem: Product = { 
                          ...item, 
                          price: discountPrice, 
                          originalPrice: item.price 
                      };

                      return (
                          <div 
                              key={item.id} 
                              onClick={() => handleProductClick(discountedItem)} 
                              className="min-w-[140px] w-[140px] bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm flex-shrink-0 relative cursor-pointer active:scale-95 transition-transform"
                          >
                              <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
                                  -30%
                              </div>
                              <img src={item.imageUrl} className="w-full h-32 object-cover" />
                              <div className="p-2">
                                  <h3 className="text-xs font-medium dark:text-white line-clamp-1 mb-1">{item.name}</h3>
                                  <div className="flex items-end gap-1.5">
                                      <span className="text-sm font-bold text-red-500">${discountPrice.toFixed(0)}</span>
                                      <span className="text-[10px] text-gray-400 line-through decoration-gray-400/70">${item.price.toFixed(0)}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                      <div className="bg-red-500 h-full w-[80%] rounded-full"></div>
                                  </div>
                                  <p className="text-[8px] text-gray-500 mt-1">Almost gone</p>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };
  
  const renderTrackOrder = () => {
    if (!selectedOrder) return null;
    
    const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
    // determine current step index based on status
    let currentStep = 0;
    if (selectedOrder.status === 'Processing') currentStep = 1;
    if (selectedOrder.status === 'Shipped') currentStep = 2;
    if (selectedOrder.status === 'Delivered') currentStep = 3;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-safe relative">
            {/* Map Placeholder */}
            <div className="h-1/2 bg-gray-200 dark:bg-slate-800 relative w-full">
                 <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover opacity-60" />
                 <button onClick={() => setView('PROFILE')} className="absolute top-4 left-4 bg-white dark:bg-slate-900 p-2 rounded-full shadow-md z-10">
                    <ArrowLeft size={20} className="dark:text-white" />
                 </button>
                 
                 {/* Driver/Location Marker */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center animate-ping absolute"></div>
                    <div className="w-8 h-8 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-xl relative z-10">
                        <Truck size={14} className="text-white" />
                    </div>
                 </div>
            </div>

            {/* Tracking Details Sheet */}
            <div className="-mt-6 bg-white dark:bg-slate-900 rounded-t-3xl relative p-6 min-h-[50vh] shadow-xl">
                <div className="w-12 h-1 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">Order {selectedOrder.id}</h2>
                        <p className="text-gray-500 text-sm">Arriving by {getFutureDate(3)}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                        {selectedOrder.status}
                    </span>
                </div>

                {/* Timeline */}
                <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 dark:border-slate-800 ml-2">
                    {steps.map((step, index) => {
                         const isCompleted = index <= currentStep;
                         const isCurrent = index === currentStep;
                         
                         return (
                            <div key={step} className="relative pl-6">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                                    isCompleted 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700'
                                } transition-colors`}>
                                    {isCompleted && <Check size={10} className="text-white absolute top-0.5 left-0.5" />}
                                </div>
                                <h4 className={`text-sm font-bold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step}</h4>
                                <p className="text-xs text-gray-400">
                                    {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                                </p>
                            </div>
                         )
                    })}
                </div>

                {/* Driver Info Mock */}
                 {selectedOrder.status !== 'Delivered' && (
                    <div className="mt-8 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm dark:text-white">Mike R.</h4>
                            <p className="text-xs text-gray-500">Delivery Partner</p>
                        </div>
                        <button className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm text-green-600">
                            <Phone size={18} />
                        </button>
                    </div>
                 )}
                 
                 {/* Items summary */}
                 <div className="mt-6">
                    <h3 className="font-bold text-sm mb-3 dark:text-white">Items</h3>
                    <div className="flex -space-x-2 overflow-hidden">
                        {selectedOrder.items.map((item, i) => (
                            <img key={i} src={item.imageUrl} className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" />
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
  };

  const renderHome = () => (
    <div className="pb-24 pt-36 px-4">
      <div className="fixed top-0 left-0 right-0 z-20">
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/50 dark:border-slate-800/50 shadow-sm transition-colors duration-300"></div>
        <div className="relative max-w-md mx-auto px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <HarbourLogo />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">HarbourMart</h1>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">Ocean of Deals</p>
                    </div>
                </div>
                {isAuthenticated && userProfile.avatarUrl && (
                    <img 
                        src={userProfile.avatarUrl} 
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover" 
                        alt="Profile" 
                    />
                )}
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/50 rounded-full blur opacity-0 group-focus-within:opacity-50 transition-opacity"></div>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search or ask AI Concierge..." 
                        className="relative w-full bg-white/80 dark:bg-slate-800 dark:text-white dark:border-slate-700 border border-gray-200 rounded-full py-3 pl-10 pr-20 text-sm focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 dark:focus:ring-blue-900/50 shadow-sm transition-all placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value === '') setAiSearchResults(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                    
                    {/* CAMERA ICON FOR VISUAL SEARCH */}
                    <button 
                        onClick={triggerImageSearch}
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Camera size={18} />
                    </button>
                    <input 
                        type="file" 
                        ref={searchCameraRef} 
                        onChange={handleImageUploadSearch} 
                        className="hidden" 
                        accept="image/*"
                    />

                    {searchQuery && (
                        <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
                            <X size={18} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={triggerAISearch}
                    disabled={aiLoading}
                    className={`p-3 rounded-full shadow-sm border border-transparent transition-all active:scale-95 ${
                        aiSearchResults 
                        ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' 
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700'
                    }`}
                >
                    <Sparkles size={20} className={aiLoading ? "animate-pulse text-blue-500" : ""} />
                </button>
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="p-3 bg-white text-gray-600 rounded-full hover:bg-gray-50 border border-gray-200 shadow-sm transition-all active:scale-95 relative dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700"
                >
                    <Filter size={20} />
                    {(filters.origins.length > 0 || filters.colors.length > 0 || filters.maxPrice < MAX_PRICE_LIMIT) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-800" />
                    )}
                </button>
            </div>
        </div>
      </div>

      {!searchQuery && !aiSearchResults && (
         <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2 max-w-md mx-auto pt-2">
            {['All', 'Clothing', 'Electronics', 'Home', 'Food', 'Accessories', 'Footwear'].map((cat) => (
                <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm border ${
                        selectedCategory === cat 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md transform -translate-y-0.5 dark:bg-white dark:text-slate-900 dark:border-white' 
                        : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:text-blue-700 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:text-white'
                    }`}
                >
                    {cat}
                </button>
            ))}
         </div>
      )}
      
      {/* FLASH SALES SECTION - Taobao style urgency */}
      {!searchQuery && !aiSearchResults && selectedCategory === 'All' && renderFlashSales()}

      {!searchQuery && !aiSearchResults && selectedCategory === 'All' && (
          <div className="max-w-md mx-auto mb-6 p-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 dark:from-blue-900 dark:via-cyan-900 dark:to-blue-800 rounded-3xl text-white shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-900 opacity-20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                  <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wider mb-2">NEW ARRIVALS</span>
                  <h2 className="text-2xl font-bold mb-1">Harbour Collection</h2>
                  <p className="text-blue-50 text-sm mb-4 opacity-90">
                    {purchaseHistory.length > 0 ? "Curated for your lifestyle." : "Discover premium items from around the globe."}
                  </p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="h-full">
              <ProductCard 
                product={product} 
                onAdd={addToCart} 
                onClick={handleProductClick} 
                isInWishlist={wishlist.some(p => p.id === product.id)}
                onToggleWishlist={toggleWishlist}
              />
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-20 text-gray-500 dark:text-gray-400">
             <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                {aiLoading ? (
                    <Sparkles className="text-blue-500 animate-spin" size={32} />
                ) : (
                    <Search className="text-gray-300 dark:text-gray-600" size={32} />
                )}
             </div>
             <p className="mb-2 font-medium">{aiLoading ? "Curating selections..." : "No products found."}</p>
             <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                {aiLoading ? "AI is finding the best matches for you." : "Try adjusting your filters or search terms."}
             </p>
             {searchQuery && !aiLoading && (
                <button onClick={triggerAISearch} className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 mx-auto hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    <Sparkles size={18} /> Ask AI Concierge
                </button>
             )}
          </div>
        )}
      </div>
      
      {aiSearchResults && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-slate-800 text-white text-xs px-5 py-2.5 rounded-full shadow-xl shadow-blue-500/20 z-20 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 border border-gray-700 dark:border-slate-600">
          <Sparkles size={12} className="text-blue-400" />
          <span className="font-medium">
            {searchQuery ? "Curated by AI Concierge" : "AI Discovery Collection"}
          </span>
          <button onClick={() => setAiSearchResults(null)} className="ml-2 p-1 hover:bg-white/20 rounded-full"><X size={10}/></button>
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="pt-8 pb-32 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Shopping Cart</h2>
        {cart.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                <button onClick={() => setView('HOME')} className="mt-4 text-blue-600 font-semibold hover:underline">Start Shopping</button>
            </div>
        ) : (
            <>
                <div className="space-y-4 mb-8">
                    {cart.map(item => (
                        <div key={item.id} className="flex gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-sm line-clamp-1 dark:text-white">{item.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.color} • {item.size}</p>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded mt-1 inline-block">FLASH DEAL</span>
                                        )}
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-lg p-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300">-</button>
                                        <span className="text-xs font-semibold w-4 text-center dark:text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300">+</button>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold dark:text-white block">${(item.price * item.quantity).toFixed(2)}</span>
                                        {item.originalPrice && (
                                            <span className="text-xs text-gray-400 line-through block">${(item.originalPrice * item.quantity).toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coupon Section */}
                <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Promo Code</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Enter code"
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                        <button onClick={handleApplyCoupon} className="bg-gray-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold">Apply</button>
                    </div>
                    {appliedCoupon && (
                        <div className="mt-3 flex items-center justify-between bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded-lg text-sm">
                            <span className="flex items-center gap-2"><Tag size={14}/> {appliedCoupon.code} applied!</span>
                            <button onClick={removeCoupon} className="text-green-800 dark:text-green-200 hover:text-green-900"><X size={14}/></button>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>${cartSubtotal.toFixed(2)}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount ({appliedCoupon.discount * 100}%)</span>
                                <span>-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Delivery</span>
                            <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-slate-800 my-2"></div>
                        <div className="flex justify-between font-bold text-lg dark:text-white">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setView('CHECKOUT')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Checkout <ArrowRight size={18} />
                    </button>
                </div>
            </>
        )}
    </div>
  );

  const renderProductDetails = () => {
    if (!selectedProduct) return null;
    const isSoldOut = selectedProduct.stockStatus === 'Sold Out';
    
    // Logic to find similar products if sold out
    const similarProducts = isSoldOut 
        ? MOCK_PRODUCTS.filter(p => 
            p.category === selectedProduct.category && 
            p.id !== selectedProduct.id && 
            p.stockStatus === 'In Stock'
          )
          // Simple relevance score based on matching tags
          .map(p => ({
              product: p,
              score: p.tags.filter(tag => selectedProduct.tags.includes(tag)).length
          }))
          .sort((a, b) => b.score - a.score) // Descending score
          .map(item => item.product)
          .slice(0, 4)
        : [];

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-24">
            <div className="relative h-96">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button onClick={() => setView('HOME')} className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-2 rounded-full shadow-sm z-10">
                    <ArrowLeft size={20} className="dark:text-white" />
                </button>
                {isSoldOut && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-center py-2 font-bold uppercase tracking-widest text-sm">
                        Sold Out
                    </div>
                )}
            </div>
            <div className="p-6 -mt-6 relative bg-white dark:bg-slate-950 rounded-t-3xl shadow-lg min-h-[500px]">
                <div className="w-12 h-1 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
                
                {/* Updated Price Display for Deals */}
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold dark:text-white max-w-[70%] leading-tight">{selectedProduct.name}</h1>
                    {selectedProduct.originalPrice ? (
                        <div className="flex flex-col items-end">
                             <div className="text-xl font-bold text-red-600 dark:text-red-400">${selectedProduct.price.toFixed(2)}</div>
                             <div className="text-sm text-gray-500 line-through decoration-gray-500">${selectedProduct.originalPrice.toFixed(2)}</div>
                             <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded mt-1">FLASH DEAL</span>
                        </div>
                    ) : (
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">${selectedProduct.price.toFixed(2)}</div>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <Star className="fill-yellow-400 text-yellow-400" size={16} />
                    <span className="font-semibold dark:text-white">{selectedProduct.rating}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{selectedProduct.origin}</span>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2 dark:text-white">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                        <span className="text-xs text-gray-500 uppercase block mb-1">Color</span>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: selectedProduct.color.toLowerCase() }}></div>
                            <span className="font-medium dark:text-white">{selectedProduct.color}</span>
                        </div>
                     </div>
                     <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                        <span className="text-xs text-gray-500 uppercase block mb-1">Size</span>
                        <span className="font-medium dark:text-white">{selectedProduct.size}</span>
                     </div>
                </div>

                {/* SIMILAR PRODUCTS SECTION */}
                {isSoldOut && similarProducts.length > 0 && (
                    <div className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-blue-500 fill-blue-500/20" />
                            <h3 className="font-bold text-lg dark:text-white">Available Alternatives</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Since this item is out of stock, check out these similar picks:</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {similarProducts.map(p => (
                                <div 
                                    key={p.id} 
                                    onClick={() => handleProductClick(p)}
                                    className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-gray-100 dark:border-slate-700 cursor-pointer active:scale-95 transition-transform shadow-sm"
                                >
                                    <div className="relative aspect-square mb-2 rounded-lg overflow-hidden">
                                        <img src={p.imageUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="font-bold text-xs truncate dark:text-white mb-1">{p.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">${p.price.toFixed(2)}</span>
                                        <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-full">
                                            <ArrowRight size={12} className="text-gray-500 dark:text-gray-400"/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-t border-gray-100 dark:border-slate-800 z-20">
                    <button 
                        onClick={() => {
                            if (!isSoldOut) {
                                addToCart(selectedProduct);
                                setView('CART');
                            } else {
                                // Maybe add to wishlist instead or notify me logic
                                showToast("We'll notify you when it's back!", "info");
                            }
                        }}
                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                            isSoldOut 
                            ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-700' 
                            : 'bg-black dark:bg-white text-white dark:text-slate-900 hover:bg-gray-800'
                        }`}
                    >
                        {isSoldOut ? <><Bell size={20}/> Notify Me When Available</> : <><ShoppingBag size={20}/> Add to Cart</>}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const renderWishlist = () => (
    <div className="pt-8 pb-32 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Your Wishlist</h2>
        {wishlist.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nothing here yet.</p>
                <button onClick={() => setView('HOME')} className="mt-4 text-blue-600 font-semibold hover:underline">Discover Items</button>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4">
                {wishlist.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAdd={addToCart} 
                        onClick={handleProductClick}
                        isInWishlist={true}
                        onToggleWishlist={toggleWishlist}
                    />
                ))}
            </div>
        )}
    </div>
  );

  const renderSupport = () => (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950 pb-safe">
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 shadow-sm z-10">
             <div className="flex items-center gap-3">
                 <button onClick={() => setView('PROFILE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
                     <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200"/>
                 </button>
                 <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHumanAgent ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                         {isHumanAgent ? <Headphones size={20} /> : <Sparkles size={20} />}
                     </div>
                     <div>
                         <h2 className="font-bold dark:text-white leading-tight">{isHumanAgent ? 'Sarah (Human Agent)' : 'Harbour Assistant'}</h2>
                         <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Online
                         </p>
                     </div>
                 </div>
             </div>
             {!isHumanAgent && (
                 <button 
                    onClick={switchToHuman}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                 >
                     Speak to Human
                 </button>
             )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'user' && msg.role !== 'system' && (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 ${isHumanAgent ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                             {isHumanAgent ? <Headphones size={14} /> : <Sparkles size={14} />}
                         </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : msg.role === 'system'
                        ? 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-center w-full max-w-none bg-transparent shadow-none italic'
                        : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-slate-800'
                    }`}>
                         {msg.isTyping ? <div className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></div> : msg.text}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 border-t border-gray-200 dark:border-slate-800 pb-8">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 max-w-md mx-auto">
                <input 
                    type="text" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isHumanAgent ? "Message Sarah..." : "Ask for help, status check, or refunds..."}
                    className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent dark:border-slate-700"
                />
                <button 
                    type="submit"
                    disabled={!chatInput.trim() || (!chatSession && !isHumanAgent)}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-transform active:scale-95"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    </div>
  );

  // Helper for Settings to avoid duplication
  const renderSettingsSection = () => (
     <section>
        <h3 className="font-semibold mb-3 flex items-center gap-2 dark:text-white"><Settings size={18}/> App Settings</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-300"><Bell size={18} /></div>
                    <span className="text-sm font-medium dark:text-white">Push Notifications</span>
                </div>
                {isAuthenticated ? (
                    <button onClick={() => toggleSetting('notifications')} className={`w-11 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.notifications ? 'left-[22px]' : 'left-0.5'}`}></div>
                    </button>
                ) : (
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Login Required</span>
                )}
            </div>
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300"><Moon size={18} /></div>
                    <span className="text-sm font-medium dark:text-white">Dark Mode</span>
                </div>
                <button onClick={() => toggleSetting('darkMode')} className={`w-11 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.darkMode ? 'left-[22px]' : 'left-0.5'}`}></div>
                </button>
            </div>
        </div>
     </section>
  );

  const renderProfile = () => (
    <div className="pb-32 min-h-screen bg-gray-50 dark:bg-slate-950">
        {!isAuthenticated ? (
            <div className="pt-20 px-6 max-w-sm mx-auto">
                {/* 2FA VERIFICATION SCREEN */}
                {isVerifying ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mx-auto flex items-center justify-center mb-4">
                                <ShieldCheck className="text-blue-600 dark:text-blue-400" size={32} />
                            </div>
                            <h1 className="text-2xl font-bold dark:text-white mb-2">Verify Identity</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Enter the 6-digit code sent to <span className="font-semibold text-gray-800 dark:text-white">{authForm.email}</span>.
                            </p>
                        </div>

                        <form onSubmit={handleVerify2FA} className="space-y-6">
                            <div>
                                <input 
                                    type="text" 
                                    maxLength={6}
                                    className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-[0.5em] font-mono" 
                                    placeholder="000000"
                                    value={inputCode}
                                    onChange={e => setInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                                />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">
                                Verify Access
                            </button>

                            <div className="text-center space-y-4">
                                <button type="button" onClick={resendCode} className="text-blue-600 text-sm font-semibold hover:underline">
                                    Resend Code
                                </button>
                                <div>
                                    <button type="button" onClick={() => setIsVerifying(false)} className="text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-200">
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none mb-4">
                                <Anchor className="text-white" size={32} />
                            </div>
                            <h1 className="text-3xl font-bold dark:text-white mb-2">Welcome to Harbour</h1>
                            <p className="text-gray-500 dark:text-gray-400">Sign in to access your orders and curated picks.</p>
                        </div>
                        
                        <form onSubmit={handleAuth} className="space-y-4">
                            {authMode === 'SIGNUP' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="John Doe"
                                        value={authForm.name}
                                        onChange={e => setAuthForm({...authForm, name: e.target.value})}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="you@example.com"
                                    value={authForm.email}
                                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="••••••••"
                                    value={authForm.password}
                                    onChange={e => setAuthForm({...authForm, password: e.target.value})}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-gray-400">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button id="auth-btn" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-4">
                                {authMode === 'LOGIN' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>
                        
                        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            {authMode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-blue-600 font-semibold hover:underline">
                                {authMode === 'LOGIN' ? 'Sign Up' : 'Log In'}
                            </button>
                        </div>
                        
                        {/* SETTINGS FOR GUEST USER */}
                        <div className="mt-12 border-t border-gray-200 dark:border-slate-800 pt-8 mb-8">
                             {renderSettingsSection()}
                        </div>
                    </>
                )}
            </div>
        ) : (
            <div>
                {/* Profile Header */}
                <div className="bg-white dark:bg-slate-900 pb-6 pt-12 px-6 rounded-b-3xl shadow-sm border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-800">
                                {userProfile.avatarUrl ? (
                                    <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-4 text-gray-400" />
                                )}
                            </div>
                            <button onClick={triggerFileUpload} className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900">
                                <Camera size={14} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">{userProfile.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile.email}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">GOLD MEMBER</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveProfileTab('DETAILS')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeProfileTab === 'DETAILS' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            My Details
                        </button>
                        <button 
                            onClick={() => setActiveProfileTab('ORDERS')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeProfileTab === 'ORDERS' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Orders
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeProfileTab === 'DETAILS' ? (
                        <div className="space-y-6">
                            {/* CUSTOMER SUPPORT BUTTON - NEW */}
                            <button 
                                onClick={() => setView('SUPPORT')}
                                className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none text-white flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <MessageSquare size={20} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold block">Customer Support 24/7</span>
                                        <span className="text-xs text-blue-100">Talk to AI or an Agent</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-white/70 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <section>
                                <h3 className="font-semibold mb-3 flex items-center gap-2 dark:text-white"><Ruler size={18}/> Size Preferences</h3>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Clothing Size</span>
                                        <select 
                                            name="clothingSize" 
                                            value={userProfile.clothingSize}
                                            onChange={handleProfileChange}
                                            className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium dark:text-white"
                                        >
                                            {['XS','S','M','L','XL'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Shoe Size (US)</span>
                                        <input 
                                            name="shoeSize"
                                            value={userProfile.shoeSize}
                                            onChange={handleProfileChange}
                                            className="w-16 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-center dark:text-white"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Reusing the Settings Section Logic */}
                            {renderSettingsSection()}
                            
                            <button onClick={handleSignOut} className="w-full py-4 text-red-500 font-medium bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                                <LogOut size={18}/> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center py-10">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No orders yet.</p>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                                        <div className="flex justify-between mb-3">
                                            <div>
                                                <span className="text-xs font-bold text-gray-500">ORDER {order.id}</span>
                                                <p className="text-sm font-medium dark:text-white">{order.date}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-md h-fit">{order.status}</span>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex gap-3">
                                                    <img src={item.imageUrl} className="w-10 h-10 rounded-md object-cover" />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{item.name}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                                            <span className="text-sm font-medium dark:text-white">Total: ${order.total.toFixed(2)}</span>
                                            <button onClick={() => handleTrackOrder(order)} className="text-sm text-blue-600 font-medium hover:underline">Track Order</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
        
        {/* TOAST NOTIFICATION CONTAINER */}
        {toast && (
            <div className={`fixed top-4 left-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-xl animate-in slide-in-from-top-4 duration-300 ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 
                toast.type === 'error' ? 'bg-red-500 text-white' : 
                'bg-gray-900 text-white'
            }`}>
                {toast.type === 'success' ? <Check size={24} className="mr-3" /> :
                 toast.type === 'error' ? <AlertCircle size={24} className="mr-3" /> :
                 <Info size={24} className="mr-3" />}
                <div className="font-medium text-sm">{toast.message}</div>
            </div>
        )}
    </div>
  );

  const renderCheckout = () => (
    <div className="pt-20 px-4 pb-24 max-w-md mx-auto">
        <button onClick={() => setView('CART')} className="flex items-center text-gray-500 mb-6 hover:text-gray-800">
            <ArrowLeft size={18} className="mr-1" /> Back to Cart
        </button>
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Checkout</h2>
        
        <div className="space-y-6">
            <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-white"><MapPin size={18} className="text-blue-500"/> Shipping Address</h3>
                <div className="grid gap-4">
                    <input 
                        name="fullName"
                        placeholder="Full Name" 
                        value={deliveryDetails.fullName}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} dark:text-white`}
                    />
                    <input 
                        name="address"
                        placeholder="Street Address" 
                        value={deliveryDetails.address}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border ${formErrors.address ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} dark:text-white`}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            name="city"
                            placeholder="City" 
                            value={deliveryDetails.city}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border ${formErrors.city ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} dark:text-white`}
                        />
                        <input 
                            name="zipCode"
                            placeholder="ZIP Code" 
                            value={deliveryDetails.zipCode}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border ${formErrors.zipCode ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} dark:text-white`}
                        />
                    </div>
                    <input 
                        name="phone"
                        placeholder="Phone Number" 
                        value={deliveryDetails.phone}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border ${formErrors.phone ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} dark:text-white`}
                    />
                </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-white"><Truck size={18} className="text-blue-500"/> Delivery Method</h3>
                <div className="space-y-3">
                    <div 
                        onClick={() => setDeliveryDetails({...deliveryDetails, deliveryMethod: 'Standard'})}
                        className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer ${deliveryDetails.deliveryMethod === 'Standard' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700'}`}
                    >
                        <div>
                            <span className="font-semibold block dark:text-white">Standard Delivery</span>
                            <span className="text-xs text-gray-500">3-5 business days</span>
                        </div>
                        <span className="font-bold dark:text-white">Free</span>
                    </div>
                    <div 
                        onClick={() => setDeliveryDetails({...deliveryDetails, deliveryMethod: 'Express'})}
                        className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer ${deliveryDetails.deliveryMethod === 'Express' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700'}`}
                    >
                        <div>
                            <span className="font-semibold block dark:text-white">Express Delivery</span>
                            <span className="text-xs text-gray-500">1-2 business days</span>
                        </div>
                        <span className="font-bold dark:text-white">$14.99</span>
                    </div>
                </div>
            </section>

            <button 
                onClick={handlePlaceOrder}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
            >
                Pay ${finalTotal.toFixed(2)}
            </button>
        </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Check className="text-green-600 dark:text-green-400" size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2 dark:text-white">Order Confirmed!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">Your order has been placed successfully. We'll send you an email with tracking details shortly.</p>
        
        {coupons.length > 0 && !coupons[coupons.length-1].isUsed && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl text-white mb-8 w-full max-w-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <h3 className="font-bold text-lg mb-1">A Gift For You!</h3>
                <p className="text-purple-100 text-sm mb-3">Use this code on your next order:</p>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-center font-mono text-xl tracking-widest font-bold">
                    {coupons[coupons.length-1].code}
                </div>
            </div>
        )}

        {aiLoading && (
            <div className="mb-6 flex items-center gap-2 text-blue-600">
                <Sparkles className="animate-spin" size={20}/>
                <span className="font-medium">AI is picking recommendations...</span>
            </div>
        )}

        {!aiLoading && recommendedProductIds.length > 0 && (
            <div className="w-full max-w-md mb-8">
                <div className="flex items-center gap-2 mb-4 justify-center">
                    <Sparkles className="text-blue-500" size={18} />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{recommendationReason || "You might also like"}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {MOCK_PRODUCTS.filter(p => recommendedProductIds.includes(p.id)).slice(0,3).map(product => (
                         <div key={product.id} onClick={() => handleProductClick(product)} className="bg-gray-50 dark:bg-slate-900 rounded-lg p-2 cursor-pointer border border-gray-100 dark:border-slate-800">
                            <img src={product.imageUrl} className="w-full h-20 object-cover rounded-md mb-2" />
                            <p className="text-[10px] font-bold truncate dark:text-white">{product.name}</p>
                         </div>
                    ))}
                </div>
            </div>
        )}

        <button 
            onClick={() => setView('HOME')}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg"
        >
            Continue Shopping
        </button>
    </div>
  );

  return (
    <div 
        className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 pb-24 transition-colors duration-300"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
        <div key={view} className={animClass}>
            {view === 'HOME' && renderHome()}
            {view === 'WISHLIST' && renderWishlist()}
            {view === 'CART' && renderCart()}
            {view === 'PROFILE' && renderProfile()}
            {view === 'PRODUCT_DETAILS' && selectedProduct && renderProductDetails()}
            {view === 'CHECKOUT' && renderCheckout()}
            {view === 'SUCCESS' && renderSuccess()}
            {view === 'SUPPORT' && renderSupport()}
            {view === 'TRACK_ORDER' && renderTrackOrder()}
        </div>

        <FilterModal 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          availableOrigins={ORIGINS}
          availableColors={COLORS}
          maxPriceLimit={MAX_PRICE_LIMIT}
        />

        {/* Bottom Navigation */}
        {['HOME', 'WISHLIST', 'CART', 'PROFILE'].includes(view) && (
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 pb-safe pt-1 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <button 
                        onClick={() => setView('HOME')} 
                        className={`flex flex-col items-center justify-center w-16 py-2 rounded-xl transition-all ${
                            view === 'HOME' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        <Home size={24} strokeWidth={view === 'HOME' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">Home</span>
                    </button>
                    
                    <button 
                        onClick={() => setView('WISHLIST')} 
                        className={`flex flex-col items-center justify-center w-16 py-2 rounded-xl transition-all ${
                            view === 'WISHLIST' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        <Heart size={24} strokeWidth={view === 'WISHLIST' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">Wishlist</span>
                    </button>
                    
                    <button 
                        onClick={() => setView('CART')} 
                        className={`flex flex-col items-center justify-center w-16 py-2 rounded-xl transition-all relative ${
                            view === 'CART' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        <div className="relative">
                            <ShoppingBag size={24} strokeWidth={view === 'CART' ? 2.5 : 2} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium mt-1">Cart</span>
                    </button>
                    
                    <button 
                        onClick={() => setView('PROFILE')} 
                        className={`flex flex-col items-center justify-center w-16 py-2 rounded-xl transition-all ${
                            view === 'PROFILE' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        <User size={24} strokeWidth={view === 'PROFILE' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">Profile</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;
