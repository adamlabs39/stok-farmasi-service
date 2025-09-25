import express from "express";
import PermintaanUnitController from "../controller/permintaan-unit.controller.js";

const apiBase = process.env.API_BASE || "api";
const apiVersion = process.env.API_VERSION || "v1";
const baseUrl = `/${apiBase}/${apiVersion}/stok`;

const routes = express.Router();

// HEALTH CHECK
routes.get(`${baseUrl}/health`, (req, res) => res.status(200).json({ message: "OK" }));


// PERMINTAAN UNIT
routes.post(`${baseUrl}/permintaan-unit`, PermintaanUnitController.createPermintaanUnit);

export default routes;


