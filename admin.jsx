import React, { useState } from "react";
import "./styles.css"; // TailwindCSS cần được cấu hình sẵn trong dự án

const Sidebar = () => (
  <div className="w-64 h-screen bg-gray-900 text-white p-4 flex flex-col">
    <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
    <nav>
      <ul>
        <li className="mb-2">
          <a href="#" className="text-blue-400 hover:text-blue-300">
            Dashboard
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">
            User Management
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">
            Post Management
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">
            Statistics
          </a>
        </li>
      </ul>
    </nav>
    <div className="mt-auto">
      <p className="text-sm">admin@gmail.com</p>
      <p className="text-sm">Administrator</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("Last Month");

  const cards = [
    { title: "Total Users", value: "1,245", change: "+12.5%", color: "green" },
    { title: "Total Posts", value: "8,732", change: "+8.2%", color: "green" },
    { title: "Likes", value: "45,289", change: "+15.7%", color: "green" },
    { title: "Comments", value: "12,456", change: "-3.2%", color: "red" },
  ];

  return (
    <div className="ml-64 p-6 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Insta</h1>
        <div>
          <label className="mr-2">Time Period:</label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="border p-1 rounded"
          >
            <option>Last Month</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded shadow">
            <p>{card.title}</p>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className={`text-${card.color}-500`}>{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">User Growth</h3>
          <div style={{ width: "100%", height: "200px" }}>
            <p>Chart: User Growth (Jan - Jun)</p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Post Creation</h3>
          <div style={{ width: "100%", height: "200px" }}>
            <p>Chart: Post Creation (Jan - May)</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded shadow">
        <p>Auth Debug:</p>
        <p>Loading: false</p>
        <p>Authenticated: false</p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Dashboard />
    </div>
  );
}
