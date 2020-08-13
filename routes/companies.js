//import express
const express = require("express");

//import other files/functions you will uses
const db = require("../db");

//create your router
const companiesRouter = express.Router();



companiesRouter.get("/", async function (req, res, next) {
  try {
    const results = await db.query(
        `SELECT code, name
        FROM companies`);
    const companies = results.rows
    return res.json({ companies });

  } catch (err) {
    return next(err);
  }
});

//Export router
module.exports = companiesRouter;