const { getDb } = require('../config/firebase');

const DAY_MS = 24 * 60 * 60 * 1000;

class ReportController {
  async summary(req, res) {
    const now = Date.now();
    const to = req.query.to === undefined ? now : Number(req.query.to);
    const from = req.query.from === undefined ? to - 30 * DAY_MS : Number(req.query.from);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < from) {
      return res.status(400).json({ success: false, message: 'from and to must be valid millisecond timestamps, with from <= to' });
    }
    try {
      const db = getDb();
      const [logsSnapshot, cardsSnapshot, statusSnapshot] = await Promise.all([
        db.ref('parking/logs').orderByChild('timestamp').startAt(from).endAt(to).once('value'),
        db.ref('parking/cards').once('value'),
        db.ref('parking/status').once('value')
      ]);
      const logs = Object.values(logsSnapshot.val() || {});
      const cards = Object.values(cardsSnapshot.val() || {});
      const daily = new Map();
      const summary = { total: logs.length, entries: 0, exits: 0, rejected: 0, residents: 0, guests: 0 };
      for (const log of logs) {
        if (log.result && log.result !== 'SUCCESS') summary.rejected++;
        else if (log.gate === 'entry' || log.action === 'IN') summary.entries++;
        else if (log.gate === 'exit' || log.action === 'OUT') summary.exits++;
        const day = new Date(Number(log.timestamp) || 0).toISOString().slice(0, 10);
        const bucket = daily.get(day) || { date: day, entries: 0, exits: 0, rejected: 0 };
        if (log.result && log.result !== 'SUCCESS') bucket.rejected++;
        else if (log.gate === 'entry' || log.action === 'IN') bucket.entries++;
        else if (log.gate === 'exit' || log.action === 'OUT') bucket.exits++;
        daily.set(day, bucket);
      }
      const cardCounts = { resident: 0, guest: 0, active: 0, blocked: 0 };
      for (const card of cards) {
        const type = card.cardType === 'guest' ? 'guest' : 'resident';
        cardCounts[type]++;
        if (card.status === 'blocked') cardCounts.blocked++;
        else cardCounts.active++;
      }
      const status = statusSnapshot.val() || {};
      return res.json({
        success: true,
        data: {
          range: { from, to },
          traffic: summary,
          cards: cardCounts,
          occupancy: { totalSlots: Number(status.totalSlots) || 0, availableSlots: Number(status.availableSlots) || 0 },
          daily: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date))
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Unable to generate report' });
    }
  }
}

module.exports = new ReportController();
