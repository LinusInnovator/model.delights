"use client";

import dynamic from 'next/dynamic';

const ComparisonChart = dynamic(() => import('@/components/ComparisonChart'), { ssr: false });

export default ComparisonChart;
