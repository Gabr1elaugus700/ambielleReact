import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/home",
        destination: "/features/home",
      },
      {
        source: "/clientes",
        destination: "/features/clientes",
      },
      {
        source: "/servicos",
        destination: "/features/servicos",
      },
      {
        source: "/tarefas",
        destination: "/features/tarefas",
      },
      {
        source: "/relatorios",
        destination: "/features/relatorios",
      },
      {
        source: "/suportes",
        destination: "/features/suportes",
      },
    ];
  },
};

export default nextConfig;
