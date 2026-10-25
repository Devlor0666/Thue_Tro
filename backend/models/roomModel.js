const db = require("../config/db");

const listingSelect = `
  SELECT p.id, p.chuTroId, p.diaChi, p.diaChiTinh, p.diaChiXa, p.dienTich, p.giaThue,
         p.trangThai AS trangThaiPhong, p.moTa AS moTaPhong, p.ngayTao,
         l.id AS tinDangId, l.tieuDe, l.moTa AS moTaTinDang, l.trangThai AS trangThaiTinDang,
         u.hoTen AS tenChuTro, u.soDienThoai AS dienThoaiChuTro,
         (SELECT a.duongDan FROM AnhPhong a WHERE a.phongId = p.id ORDER BY a.id LIMIT 1) AS anhDaiDien,
         (SELECT COUNT(*) FROM AnhPhong a WHERE a.phongId = p.id) AS soAnh,
         (SELECT ROUND(AVG(d.soSao), 1) FROM DanhGia d WHERE d.phongId = p.id) AS diemDanhGia,
         (SELECT COUNT(*) FROM DanhGia d WHERE d.phongId = p.id) AS soDanhGia
  FROM Phong p
  JOIN TinDang l ON l.id = (SELECT l2.id FROM TinDang l2 WHERE l2.phongId = p.id ORDER BY l2.id DESC LIMIT 1)
  JOIN NguoiDung u ON u.id = p.chuTroId
`;

const listRooms = async (filters = {}) => {
  const { q, tinh, xa, minPrice, maxPrice, minArea, maxArea, page = 1, limit = 12, sort = "newest" } = filters;
  const clauses = ["p.trangThai = 'trong'", "l.trangThai = 'da_dang'", "u.trangThai = 'hoat_dong'"];
  const values = [];
  if (q) { clauses.push("(l.tieuDe LIKE ? OR p.diaChi LIKE ? OR p.moTa LIKE ? OR l.moTa LIKE ?)"); values.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
  if (tinh) { clauses.push("p.diaChiTinh = ?"); values.push(tinh); }
  if (xa) { clauses.push("p.diaChiXa = ?"); values.push(xa); }
  if (minPrice !== undefined) { clauses.push("p.giaThue >= ?"); values.push(minPrice); }
  if (maxPrice !== undefined) { clauses.push("p.giaThue <= ?"); values.push(maxPrice); }
  if (minArea !== undefined) { clauses.push("p.dienTich >= ?"); values.push(minArea); }
  if (maxArea !== undefined) { clauses.push("p.dienTich <= ?"); values.push(maxArea); }
  const where = `WHERE ${clauses.join(" AND ")}`;
  const orderBy = sort === "price_asc" ? "p.giaThue ASC" : sort === "price_desc" ? "p.giaThue DESC" : "p.ngayTao DESC";
  const offset = (Number(page) - 1) * Number(limit);
  const [rows] = await db.execute(`${listingSelect} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [...values, Number(limit), offset]);
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM Phong p JOIN TinDang l ON l.id = (SELECT l2.id FROM TinDang l2 WHERE l2.phongId = p.id ORDER BY l2.id DESC LIMIT 1) JOIN NguoiDung u ON u.id = p.chuTroId ${where}`,
    values,
  );
  return { data: rows, pagination: { page: Number(page), limit: Number(limit), total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / Number(limit)) } };
};

const getRoomById = async (id) => {
  const [rows] = await db.execute(`${listingSelect} WHERE p.id = ? AND p.trangThai = 'trong' AND l.trangThai = 'da_dang' AND u.trangThai = 'hoat_dong' LIMIT 1`, [id]);
  if (!rows[0]) return null;
  const [images] = await db.execute("SELECT id, duongDan, ngayTao FROM AnhPhong WHERE phongId = ? ORDER BY id", [id]);
  return { ...rows[0], anhPhong: images };
};

const getRoomOwner = async (id) => {
  const [rows] = await db.execute("SELECT id, chuTroId, trangThai FROM Phong WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
};

const getMyRoomDetail = async (id) => {
  const [rows] = await db.execute(
    `SELECT p.id, p.chuTroId, p.diaChi, p.diaChiTinh, p.diaChiXa, p.dienTich, p.giaThue,
            p.trangThai AS trangThaiPhong, p.moTa AS moTaPhong, p.ngayTao,
            l.id AS tinDangId, l.tieuDe, l.moTa AS moTaTinDang, l.trangThai AS trangThaiTinDang
     FROM Phong p LEFT JOIN TinDang l
       ON l.id = (SELECT l2.id FROM TinDang l2 WHERE l2.phongId = p.id ORDER BY l2.id DESC LIMIT 1)
     WHERE p.id = ? LIMIT 1`, [id]);
  if (!rows[0]) return null;
  const [images] = await db.execute("SELECT id, duongDan, ngayTao FROM AnhPhong WHERE phongId = ? ORDER BY id", [id]);
  return { ...rows[0], anhPhong: images };
};

const getMyRooms = async (userId) => {
  const [rows] = await db.execute(
    `SELECT p.id, p.chuTroId, p.diaChi, p.diaChiTinh, p.diaChiXa, p.dienTich, p.giaThue, p.trangThai AS trangThaiPhong,
            p.moTa AS moTaPhong, p.ngayTao, l.id AS tinDangId, l.tieuDe, l.trangThai AS trangThaiTinDang,
            (SELECT a.duongDan FROM AnhPhong a WHERE a.phongId = p.id ORDER BY a.id LIMIT 1) AS anhDaiDien
     FROM Phong p LEFT JOIN TinDang l ON l.id = (SELECT l2.id FROM TinDang l2 WHERE l2.phongId = p.id ORDER BY l2.id DESC LIMIT 1)
     WHERE p.chuTroId = ? ORDER BY p.ngayTao DESC`,
    [userId],
  );
  return rows;
};

const createRoom = async (userId, data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [room] = await connection.execute(
      `INSERT INTO Phong (chuTroId, diaChi, diaChiTinh, diaChiXa, dienTich, giaThue, trangThai, moTa)
       VALUES (?, ?, ?, ?, ?, ?, 'trong', ?)`,
      [userId, data.diaChi, data.diaChiTinh, data.diaChiXa, data.dienTich, data.giaThue, data.moTa || null],
    );
    const [listing] = await connection.execute(
      "INSERT INTO TinDang (phongId, tieuDe, moTa, trangThai) VALUES (?, ?, ?, 'cho_duyet')",
      [room.insertId, data.tieuDe, data.moTaTinDang || data.moTa || null],
    );
    for (const image of (data.anhPhong || []).slice(0, 10)) {
      await connection.execute("INSERT INTO AnhPhong (phongId, duongDan) VALUES (?, ?)", [room.insertId, image]);
    }
    await connection.commit();
    return { phongId: room.insertId, tinDangId: listing.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
};

const updateRoom = async (id, data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const roomColumns = { diaChi: "diaChi", diaChiTinh: "diaChiTinh", diaChiXa: "diaChiXa", dienTich: "dienTich", giaThue: "giaThue", moTa: "moTa", trangThai: "trangThai" };
    const fields = []; const values = [];
    for (const [key, column] of Object.entries(roomColumns)) {
      if (data[key] !== undefined) { fields.push(`${column} = ?`); values.push(data[key]); }
    }
    if (fields.length) {
      values.push(id);
      await connection.execute(`UPDATE Phong SET ${fields.join(", ")} WHERE id = ?`, values);
    }
    if (data.tieuDe !== undefined || data.moTaTinDang !== undefined) {
      const listFields = []; const listValues = [];
      if (data.tieuDe !== undefined) { listFields.push("tieuDe = ?"); listValues.push(data.tieuDe); }
      if (data.moTaTinDang !== undefined) { listFields.push("moTa = ?"); listValues.push(data.moTaTinDang); }
      listValues.push(id);
      await connection.execute(`UPDATE TinDang SET ${listFields.join(", ")}, trangThai = 'cho_duyet' WHERE phongId = ? ORDER BY id DESC LIMIT 1`, listValues);
    }
    if (Array.isArray(data.anhPhong)) {
      await connection.execute("DELETE FROM AnhPhong WHERE phongId = ?", [id]);
      for (const image of data.anhPhong.slice(0, 10)) {
        await connection.execute("INSERT INTO AnhPhong (phongId, duongDan) VALUES (?, ?)", [id, image]);
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
};

const hideRoom = async (id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("UPDATE Phong SET trangThai = 'bao_tri' WHERE id = ?", [id]);
    await connection.execute("UPDATE TinDang SET trangThai = 'da_an' WHERE phongId = ? AND trangThai IN ('da_dang', 'cho_duyet')", [id]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
};

const getListings = async () => {
  const [rows] = await db.execute(
    `SELECT l.id, l.phongId, l.tieuDe, l.moTa, l.trangThai, l.ngayDang,
            p.diaChi, p.diaChiTinh, p.diaChiXa, p.giaThue, p.dienTich, p.chuTroId, u.hoTen AS tenChuTro, u.email
     FROM TinDang l JOIN Phong p ON p.id = l.phongId JOIN NguoiDung u ON u.id = p.chuTroId
     ORDER BY CASE l.trangThai WHEN 'cho_duyet' THEN 0 ELSE 1 END, l.ngayDang DESC`,
  );
  return rows;
};

const setListingStatus = async (id, trangThai) => {
  const [result] = await db.execute("UPDATE TinDang SET trangThai = ? WHERE id = ?", [trangThai, id]);
  return result.affectedRows > 0;
};

module.exports = { listRooms, getRoomById, getRoomOwner, getMyRoomDetail, getMyRooms, createRoom, updateRoom, hideRoom, getListings, setListingStatus };
