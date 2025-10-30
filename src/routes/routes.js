import express from "express";
import PermintaanUnitController from "../controller/permintaan-unit.controller.js";
import PengeluaranUnitController from "../controller/pengeluaran-unit.controller.js";
import ReturUnitController from "../controller/retur-unit.controller.js";

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

// PENGELUARAN UNIT
routes.post(`${baseUrl}/pengeluaran-unit`, PengeluaranUnitController.createPengeluaranUnit);
routes.get(`${baseUrl}/pengeluaran-unit/search-item`, PengeluaranUnitController.searchItem);
routes.get(`${baseUrl}/pengeluaran-unit`, PengeluaranUnitController.getAllPengeluaranUnit);
routes.get(`${baseUrl}/pengeluaran-unit/:uuid`, PengeluaranUnitController.getPengeluaranUnitByUuid);

// RETUR UNIT
routes.post(`${baseUrl}/retur-unit`, ReturUnitController.createReturUnit);
routes.get(`${baseUrl}/retur-unit`, ReturUnitController.getAllReturUnit);
routes.get(`${baseUrl}/retur-unit/:uuid`, ReturUnitController.getReturUnitByUuid);

export default routes;


