import React from 'react';
import { useNavigate } from 'react-router-dom';
import Feed from './Feed';

// This component wraps Feed and provides the renamed "Internal News" functionality
const InternalNews = () => {
  return <Feed />;
};

export default InternalNews;
