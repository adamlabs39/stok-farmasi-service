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
routes.get(`${baseUrl}/permintaan-unit`, PermintaanUnitController.getAllPermintaanUnit);
routes.put(`${baseUrl}/permintaan-unit/:uuid/status`,PermintaanUnitController.updateStatusPenerimaan);
routes.get(`${baseUrl}/permintaan-unit/search-item`, PermintaanUnitController.searchitem);
routes.get(`${baseUrl}/permintaan-unit/:uuid`, PermintaanUnitController.getPermintaanUnitByUuid);
routes.get(`${baseUrl}/permintaan-unit/:uuid/cetak`, PermintaanUnitController.getPermintaanUnitByUuid);

export default routes;


