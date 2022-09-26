const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

exports.loadSessions= async (req, res, next) => {
        try {
          const querySnapshot = await db.collection("contacts").get();
          const contacts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          res.status(201).json({
            clients: contacts
        });
        } catch (error) {
          console.error(error);
        }
}