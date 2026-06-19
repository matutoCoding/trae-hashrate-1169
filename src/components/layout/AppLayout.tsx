import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '@/store/appStore';

const AppLayout: React.FC = () => {
  const recomputeMergeCandidates = useAppStore(s => s.recomputeMergeCandidates);
  const recomputeNodeDeadlines = useAppStore(s => s.recomputeNodeDeadlines);
  const processTimeouts = useAppStore(s => s.processTimeouts);

  useEffect(() => {
    recomputeMergeCandidates();
    processTimeouts();
    const timer = setInterval(() => {
      processTimeouts();
      recomputeNodeDeadlines();
    }, 60000);
    return () => clearInterval(timer);
  }, [recomputeMergeCandidates, recomputeNodeDeadlines, processTimeouts]);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex-1 p-6 overflow-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
