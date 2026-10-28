import express from "express";
import { getPublicStats } from "../controllers/statController.js";

const statRoute = express.Router();

statRoute.get("/public", getPublicStats);

export default statRoute;
