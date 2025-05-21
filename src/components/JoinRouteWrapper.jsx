import React from 'react';
import { useParams } from 'react-router-dom';
import JoinPage from '@/pages/join-page';

const JoinRouteWrapper = ({ onLogin }) => {
  const { joinCode } = useParams();
  const householdData = { householdId: `household-${joinCode}`, householdName: `Household ${joinCode.substring(0,4)}` };
  return <JoinPage joinCode={joinCode} onLogin={onLogin} householdData={householdData} />;
};

export default JoinRouteWrapper;