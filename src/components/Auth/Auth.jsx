import { useState } from 'react';
import { supabase } from '../../supabase';
import styles from './Auth.module.css';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link! (If you disabled email confirmations in Supabase, you can log in immediately)');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authLogoWrapper}>
          <div className={styles.authLogo}>
            <span>♠</span>
          </div>
        </div>
        <h2 className={styles.authTitle}>Poker Tracker Login</h2>
        
        {error && <div className={`${styles.authAlert} ${styles.authAlertError}`}>{error}</div>}
        {message && <div className={`${styles.authAlert} ${styles.authAlertSuccess}`}>{message}</div>}
        
        <form onSubmit={handleAuth} className={styles.authForm}>
          <div className={styles.authFormGroup}>
            <label className={styles.authLabel}>Email</label>
            <input
              className={styles.authInput}
              type="email"
              placeholder="Your email address"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.authFormGroup}>
            <label className={styles.authLabel}>Password</label>
            <input
              className={styles.authInput}
              type="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className={styles.authSubmitBtn} disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <div className={styles.authFooter}>
          <button 
            type="button" 
            className={styles.authToggleBtn}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
