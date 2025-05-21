import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardCard = ({ card, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div
      key={card.title}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Link to={card.link} className="block h-full">
        <Card className={`h-full card-hover ${card.className} text-white`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-85">{card.description}</p>
            <div className="text-3xl font-bold mt-2">{card.count}</div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default DashboardCard;