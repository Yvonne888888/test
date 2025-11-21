import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isDeviceVerified, setIsDeviceVerified] = useState(false);

  useEffect(() => {
    // Check if this device has already verified the class code
    const verified = localStorage.getItem('class_gather_verified');
    if (verified === 'true') {
      setIsDeviceVerified(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('请输入你的名字');
      return;
    }

    // If device is not verified, check the code
    if (!isDeviceVerified) {
        if (code.toUpperCase() !== 'LN91') {
            setError('班级暗号不正确');
            return;
        }
        // Verify success, save to storage
        localStorage.setItem('class_gather_verified', 'true');
    }
    
    onLogin(name);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">欢迎回家，老同学！</h1>
          <p className="text-slate-500 mt-2">
             {isDeviceVerified ? '请输入姓名进入' : '输入姓名和班级暗号进入'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">你的名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="例如：李明"
            />
          </div>
          
          {!isDeviceVerified && (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">班级暗号</label>
                <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="请输入班级暗号"
                />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full shadow-md" size="lg">
            验证身份
          </Button>
        </form>
      </div>
    </div>
  );
};