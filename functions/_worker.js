/**
 * Cloudflare Pages Functions 入口
 * 将 Worker 的入口文件暴露给 Pages Functions 运行时，
 * 使得官网 + API 可以通过 Pages 方式部署，支持 Git 集成自动部署。
 */
export { default } from '../src/index.js'
