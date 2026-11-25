import React, { useState } from 'react';
import { CreditCard, Plus, Lock, Unlock, Trash2 } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { ref, set, update, remove } from 'firebase/database';
import { db } from '../../config/firebase';

export default function CardList() {
  const { cards } = useParking();
  const [newUid, setNewUid] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  const cardList = Object.keys(cards || {}).map(key => ({
    uid: key,
    ...cards[key]
  }));

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newUid.trim()) return;

    const formattedUid = newUid.trim().toUpperCase();
    await set(ref(db, `parking/cards/${formattedUid}`), {
      uid: formattedUid,
      ownerName: ownerName.trim() || 'Khách vãng lai',
      licensePlate: licensePlate.trim() || 'Chưa cập nhật',
      status: 'active',
      createdAt: Date.now()
    });

    setNewUid('');
    setOwnerName('');
    setLicensePlate('');
  };

  const toggleStatus = async (uid, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await update(ref(db, `parking/cards/${uid}`), {
      status: newStatus,
      updatedAt: Date.now()
    });
  };

  const deleteCard = async (uid) => {
    if (confirm(`Bạn chắc chắn muốn xóa thẻ UID: ${uid}?`)) {
      await remove(ref(db, `parking/cards/${uid}`));
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <CreditCard className="w-5 h-5 text-blue-400" />
        <h3 className="text-base font-semibold text-white">Quản lý Thẻ RFID RC522 (Whitelist)</h3>
      </div>

      {/* Form thêm thẻ */}
      <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 bg-slate-900/40 p-3 rounded-lg border border-slate-700">
        <input
          type="text"
          placeholder="UID Thẻ (VD: E34B192A)"
          value={newUid}
          onChange={(e) => setNewUid(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Tên chủ xe"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Biển số xe"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Thẻ</span>
        </button>
      </form>

      {/* Bảng danh sách thẻ */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/80 text-slate-400">
            <tr>
              <th className="py-2.5 px-3">UID</th>
              <th className="py-2.5 px-3">Chủ xe</th>
              <th className="py-2.5 px-3">Biển số</th>
              <th className="py-2.5 px-3">Trạng thái</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {cardList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-slate-500">Chưa có thẻ RFID nào được đăng ký</td>
              </tr>
            ) : (
              cardList.map((card) => (
                <tr key={card.uid} className="hover:bg-slate-750">
                  <td className="py-2.5 px-3 font-mono font-medium text-white">{card.uid}</td>
                  <td className="py-2.5 px-3">{card.ownerName || '---'}</td>
                  <td className="py-2.5 px-3">{card.licensePlate || '---'}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        card.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {card.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-2">
                    <button
                      onClick={() => toggleStatus(card.uid, card.status)}
                      title={card.status === 'active' ? 'Khóa thẻ' : 'Mở thẻ'}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                    >
                      {card.status === 'active' ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() => deleteCard(card.uid)}
                      title="Xóa thẻ"
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
