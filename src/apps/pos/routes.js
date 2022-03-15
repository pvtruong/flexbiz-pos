// eslint-disable-next-line no-unused-vars
import React from 'react';
import Home from './Home';
import Dashboard from './Dashboard';
import DashboardExt from './DashboardExt';
import Tables from './Tables';
import Sale from './Sale';
import BepMonitor from './BepMonitor';
import BartenderMonitor from './BartenderMonitor';
import Print from './Print';
import PaymentByPoints from './PaymentByPoints';
import notfound from './NotFound';

import AppInfo from "./AppInfo";

import List from './List';
import ImportData from './ImportData';
import Voucher from './Voucher';
import Report from './Report';

const routes=[
    {
        id:'home',
        path: "/",
        component: Home,
        exact:true
    },
    {
        id:'dashboard',
        path: "/dashboard",
        component: Dashboard,
        exact:true
    },
    {
        id:'dashboardext',
        path: "/dashboard-ext",
        component: DashboardExt,
        exact:true
    },

    {
        id:'appInfo',
        path: "/system/appinfo",
        component: AppInfo,
    },
    {
        id:'banhang',
        path: "/banhang",
        component: Home,
        exact:true
    },
    {
        id:'table',
        path: "/shop/:ma_kho/:ma_ban",
        component: Sale,
    },
    {
        id:'bepmonitor',
        path: "/kitchen-monitor",
        component: BepMonitor,
    },
    {
        id:'bartendermonitor',
        path: "/bartender-monitor",
        component: BartenderMonitor,
    },
    {
        id:'shop',
        path: "/shop/:ma_kho",
        component: Tables
    },
    {
        id:'print',
        path: "/print/:id_app/:token/:id",
        component: Print,
    },
    {
        id:'print2',
        path: "/print/:id",
        component: Print,
    },
    {
        id:'payment',
        path: "/payment/:id",
        component: PaymentByPoints,
    },
    {
        id:'list',
        path: "/list/:code",
        component: List,
    },
    {
        id:'list',
        path: "/import/:code",
        component: ImportData,
    },
    {
        id:'voucher',
        path: "/voucher/:code",
        component: Voucher,
    },
    {
      id:'report',
      path: "/report/:code",
      component: Report,
    },
    {
        id:'404',
        path: "/404",
        component: notfound,
        exact: true,
    },
]
export default routes;
