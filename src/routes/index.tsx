import Home from "@/home";
import Docs from '@/docs'
import Notes from "@/notes";

export const routeList = [
    {
        path: "/home",
        component: Home,
    },
    {
        path: "/docs",
        component: Docs,
    },
    {
        path: "/notes",
        component: Notes,
    },
];