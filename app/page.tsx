"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import mediaData from "../data/media_dashboard.json";

type MediaRow = {
  direction: string;
  source: string;
  media_name: string;
  status: string;
  topic: string;
  month: string;
  cost_base_rub: number;
  ord_rub: number;
  nds_rub: number;
  cost_total_rub: number;
  payment_status: string;
  reach_raw: string;
  reach_max: number;
  publication_url: string;
  utm: string;
  screenshots: string;
  clicks: number | null;
  comment: string;
};

type Summary = {
  publishedCount: number;
  publishedCost: number;
  publishedReach: number;
  averagePublicationCost: number;
  negotiationsCount: number;
  potentialCount: number;
};

const tabs = ["Общая сводка", "СМИ", "Блогеры", "ORM", "Контекстная реклама"];
const chartColors = ["#b3261e", "#d87a24", "#2f7d32", "#5d5fef", "#8b4513"];

export function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function calcOrd(base: number) {
  return base * 0.06;
}

function calcNds(base: number) {
  return (base + calcOrd(base)) * 0.05;
}

function calcTotal(base: number) {
  return base + calcOrd(base) + calcNds(base);
}

export function getPublishedMedia(data: MediaRow[]) {
  return data.filter((row) => row.status === "Опубликовано");
}

export function getPotentialMedia(data: MediaRow[]) {
  return data.filter((row) => row.status === "Хорошо" || row.status === "Отлично");
}

export function calcSummary(data: MediaRow[]): Summary {
  const published = getPublishedMedia(data);
  const publishedCost = published.reduce((sum, row) => sum + calcTotal(row.cost_base_rub), 0);
  const publishedReach = published.reduce((sum, row) => sum + row.reach_max, 0);

  return {
    publishedCount: published.length,
    publishedCost,
    publishedReach,
    averagePublicationCost: published.length ? publishedCost / published.length : 0,
    negotiationsCount: data.filter((row) => row.status === "Переговоры").length,
    potentialCount: getPotentialMedia(data).length,
  };
}

function groupByMonth(data: MediaRow[], valueGetter: (row: MediaRow) => number) {
  return Object.values(
    data.reduce<Record<string, { month: string; value: number }>>((acc, row) => {
      acc[row.month] ??= { month: row.month, value: 0 };
      acc[row.month].value += valueGetter(row);
      return acc;
    }, {}),
  );
}

function groupStatuses(data: MediaRow[]) {
  return Object.values(
    data.reduce<Record<string, { name: string; value: number }>>((acc, row) => {
      acc[row.status] ??= { name: row.status, value: 0 };
      acc[row.status].value += 1;
      return acc;
    }, {}),
  );
}

function MediaDashboard() {
  const data = mediaData as MediaRow[];
  const summary = calcSummary(data);
  const published = getPublishedMedia(data);
  const potential = getPotentialMedia(data);
  const publicationsByMonth = groupByMonth(published, () => 1);
  const costByMonth = groupByMonth(published, (row) => calcTotal(row.cost_base_rub));
  const reachByMedia = published.map((row) => ({ name: row.media_name, value: row.reach_max }));
  const statusData = groupStatuses(data);

  return (
    <>
      <section className="cards" aria-label="Ключевые показатели СМИ">
        <div className="card"><span>Опубликовано материалов</span><strong>{formatNumber(summary.publishedCount)}</strong></div>
        <div className="card"><span>Потрачено на СМИ</span><strong>{formatRub(summary.publishedCost)}</strong></div>
        <div className="card"><span>Охват публикаций</span><strong>{formatNumber(summary.publishedReach)}</strong></div>
        <div className="card"><span>Средняя стоимость публикации</span><strong>{formatRub(summary.averagePublicationCost)}</strong></div>
        <div className="card"><span>В переговорах</span><strong>{formatNumber(summary.negotiationsCount)}</strong></div>
        <div className="card"><span>Потенциальные СМИ</span><strong>{formatNumber(summary.potentialCount)}</strong></div>
      </section>

      <h2 className="section-title">Графики</h2>
      <section className="charts">
        <div className="chart-card"><h3>Публикации по месяцам</h3><ResponsiveContainer width="100%" height={260}><BarChart data={publicationsByMonth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" name="Публикации" fill="#b3261e" /></BarChart></ResponsiveContainer></div>
        <div className="chart-card"><h3>Расход по месяцам</h3><ResponsiveContainer width="100%" height={260}><BarChart data={costByMonth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value) => formatRub(Number(value))} /><Bar dataKey="value" name="Расход" fill="#d87a24" /></BarChart></ResponsiveContainer></div>
        <div className="chart-card"><h3>Статусы СМИ</h3><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>{statusData.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        <div className="chart-card"><h3>Охват по опубликованным СМИ</h3><ResponsiveContainer width="100%" height={260}><BarChart data={reachByMedia}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => formatNumber(Number(value))} /><Bar dataKey="value" name="Охват" fill="#2f7d32" /></BarChart></ResponsiveContainer></div>
      </section>

      <h2 className="section-title">Таблицы</h2>
      <section className="table-card"><h3>Опубликовано</h3><table><thead><tr><th>СМИ</th><th>Тема</th><th>Месяц</th><th>Сумма из таблицы</th><th>ОРД</th><th>НДС</th><th>Итого</th><th>Охват</th><th>Ссылка</th><th>Оплата</th></tr></thead><tbody>{published.map((row) => <tr key={row.media_name}><td>{row.media_name}</td><td>{row.topic}</td><td>{row.month}</td><td>{formatRub(row.cost_base_rub)}</td><td>{formatRub(calcOrd(row.cost_base_rub))}</td><td>{formatRub(calcNds(row.cost_base_rub))}</td><td>{formatRub(calcTotal(row.cost_base_rub))}</td><td>{formatNumber(row.reach_max)}</td><td>{row.publication_url ? <a href={row.publication_url}>Открыть</a> : "—"}</td><td>{row.payment_status}</td></tr>)}</tbody></table></section>
      <section className="table-card"><h3>Потенциальные СМИ</h3><table className="small-table"><thead><tr><th>Опубликованные СМИ</th><th>Потенциальные СМИ</th></tr></thead><tbody>{Array.from({ length: Math.max(published.length, potential.length) }).map((_, index) => <tr key={index}><td>{published[index]?.media_name ?? ""}</td><td>{potential[index]?.media_name ?? ""}</td></tr>)}</tbody></table></section>
      <section className="table-card"><h3>Темы публикаций</h3><table className="small-table"><thead><tr><th>Тема</th><th>Статус</th></tr></thead><tbody>{data.map((row, index) => <tr key={`${row.media_name}-${index}`}><td>{row.topic}</td><td><span className="status">{row.status}</span></td></tr>)}</tbody></table></section>
    </>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("СМИ");

  return (
    <main className="dashboard">
      <header className="header">
        <div><h1>Красное золото</h1><p>MVP веб-дашборда: первый этап с рабочим разделом СМИ.</p></div>
        <div className="badge">Next.js + TypeScript + Recharts</div>
      </header>
      <nav className="tabs" aria-label="Разделы дашборда">
        {tabs.map((tab) => (
          <button key={tab} className={`tab ${tab === activeTab ? "active" : ""}`} type="button" onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>
      {activeTab === "СМИ" ? (
        <MediaDashboard />
      ) : (
        <section className="placeholder" aria-label={`Раздел ${activeTab}`}>
          Раздел будет добавлен позже
        </section>
      )}
    </main>
  );
}
