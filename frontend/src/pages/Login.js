/**
 * Login Page Component - Animated Professional Design
 * Fiber @ Home Global - FGL Salesforce Management
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import fglLogo from '../assets/fgl-logo.png';

// Animated fiber optic line component
const FiberLine = ({ delay, duration, startX, startY, endX, endY }) => {
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))}%`,
        height: '2px',
        transform: `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`,
        transformOrigin: 'left center',
        animation: `fiberPulse ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <div className="h-full w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
    </div>
  );
};

// Floating particle component
const Particle = ({ size, delay, duration, x, y }) => {
  return (
    <div
      className="absolute rounded-full bg-red-500/30 blur-sm"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        top: `${y}%`,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const canvasRef = useRef(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Generate random fiber lines
  const fiberLines = React.useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    })), []
  );

  // Generate floating particles
  const particles = React.useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: 4 + Math.random() * 8,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
    })), []
  );

  useEffect(() => {
    setMounted(true);
    
    // Canvas network animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const createNodes = () => {
      nodes = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 2 + Math.random() * 2,
      }));
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.3)';
        ctx.fill();
        
        // Draw connections
        nodes.slice(i + 1).forEach(otherNode => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = `rgba(220, 38, 38, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    resize();
    createNodes();
    animate();
    
    window.addEventListener('resize', () => {
      resize();
      createNodes();
    });
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Network canvas animation */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        style={{ opacity: 0.6 }}
      />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-transparent to-red-800/20 animate-gradient" />
      </div>
      
      {/* Fiber optic lines */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {fiberLines.map(line => (
          <FiberLine key={line.id} {...line} />
        ))}
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {particles.map(particle => (
          <Particle key={particle.id} {...particle} />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div 
          className={`w-full max-w-md transform transition-all duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Glass morphism card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl animate-borderGlow" style={{
              background: 'linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.3), transparent)',
              backgroundSize: '200% 100%',
            }} />
            
            {/* Logo and Title */}
            <div 
              className={`text-center mb-8 transform transition-all duration-700 delay-300 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
            >
              <div className="mb-6 relative">
                {/* Logo container with glow effect */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 blur-xl bg-red-500/30 rounded-full animate-pulse" />
                  <img 
                    src={fglLogo} 
                    alt="Fiber @ Home Global" 
                    className="relative h-20 w-auto mx-auto drop-shadow-2xl"
                    data-testid="fgl-logo"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-gray-400 text-sm">
                Sign in to FGL Salesforce Management
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="mb-6 p-4 bg-red-500/20 backdrop-blur border border-red-500/30 text-red-200 rounded-xl animate-shake"
                data-testid="login-error-message"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
              <div 
                className={`transform transition-all duration-700 delay-500 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-red-600/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="relative w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all duration-300"
                    placeholder="your.email@fgl.com"
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div 
                className={`transform transition-all duration-700 delay-700 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-red-600/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="relative w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all duration-300"
                    placeholder="••••••••"
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              <div 
                className={`flex items-center justify-end transform transition-all duration-700 delay-800 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
              >
                <Link
                  to="/forgot-password"
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
                  data-testid="forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>

              <div 
                className={`transform transition-all duration-700 delay-900 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden group disabled:cursor-not-allowed"
                  data-testid="login-submit-button"
                >
                  {/* Button gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 transition-transform duration-300 group-hover:scale-105" />
                  
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                  
                  {/* Button text */}
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Register Link */}
            <div 
              className={`mt-8 text-center transform transition-all duration-700 delay-1000 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
            >
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors duration-200"
                  data-testid="register-link"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom branding */}
          <div 
            className={`mt-6 text-center transform transition-all duration-700 delay-1100 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}
          >
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Fiber @ Home Global Limited. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Custom animations styles */}
      <style>{`
        @keyframes fiberPulse {
          0%, 100% {
            opacity: 0;
            transform: scaleX(0);
          }
          50% {
            opacity: 0.6;
            transform: scaleX(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.6;
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes borderGlow {
          0%, 100% {
            background-position: -200% 0;
          }
          50% {
            background-position: 200% 0;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-borderGlow {
          animation: borderGlow 4s ease infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
