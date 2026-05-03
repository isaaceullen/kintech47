'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type RechartsClientProps = {
  data: any[];
};

export default function RechartsClient({ data }: RechartsClientProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-support">
        Nenhum dado de venda disponível para o gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
        <XAxis dataKey="name" stroke="#8B9BB4" tick={{fill: '#8B9BB4'}} />
        <YAxis stroke="#8B9BB4" tick={{fill: '#8B9BB4'}} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0B132B', borderColor: '#2A3441', color: '#F8FAFC' }}
          itemStyle={{ color: '#F8FAFC' }}
        />
        <Legend />
        <Bar dataKey="Custo Total" fill="#8B9BB4" />
        <Bar dataKey="Faturamento Total" fill="#C5A059" />
      </BarChart>
    </ResponsiveContainer>
  );
}
