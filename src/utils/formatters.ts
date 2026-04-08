import { toPublicUser, decimalToNumber, toDateOnly } from './helpers';

export function toSanBongResponse(s: any) {
  return {
    id: s.id,
    soNguoi: s.soNguoi,
    baoTri: s.baoTri,
    deleted: s.deleted,
    giaTiens: s.giaTiens.map((g: any) => ({
      id: g.id,
      gioBatDau: g.gioBatDau,
      gioKetThuc: g.gioKetThuc,
      giaTien: decimalToNumber(g.giaTien),
    })),
    hinhAnhs: s.hinhAnhs.map((h: any) => ({ id: h.id, thuTu: h.thuTu, url: h.url })),
  };
}

export function toTeamResponse(team: any) {
  return {
    id: team.id,
    tenDoi: team.tenDoi,
    moTa: team.moTa,
    chuDoi: toPublicUser(team.chuDoi),
  };
}

export function toTournamentTeamResponse(tt: any) {
  const soTranThang = tt.soTranThang ?? 0;
  const soTranHoa = tt.soTranHoa ?? 0;
  const soTranThua = tt.soTranThua ?? 0;
  const soBanThang = tt.soBanThang ?? 0;
  const soBanThua = tt.soBanThua ?? 0;

  return {
    id: tt.id,
    trangThai: tt.trangThai,
    soTranThang,
    soTranHoa,
    soTranThua,
    soBanThang,
    soBanThua,
    diem: tt.diem ?? 0,
    soTranDau: soTranThang + soTranHoa + soTranThua,
    hieuSo: soBanThang - soBanThua,
    team: toTeamResponse(tt.team),
  };
}

export function toMatchEventResponse(e: any) {
  return {
    id: e.id,
    eventType: e.eventType,
    minute: e.minute,
    description: e.description,
    player: e.player
      ? { id: e.player.id, nguoiDung: toPublicUser(e.player.nguoiDung) }
      : null,
    team: toTeamResponse(e.team),
  };
}

export function toMatchResponse(m: any) {
  return {
    id: m.id,
    homeTeam: toTeamResponse(m.homeTeam),
    awayTeam: toTeamResponse(m.awayTeam),
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    matchDate: m.matchDate ? m.matchDate.toISOString() : null,
    round: m.round,
    status: m.status,
    referee: m.referee,
    notes: m.notes,
    deleted: m.deleted,
    sanBong: m.sanBong ? { id: m.sanBong.id, soNguoi: m.sanBong.soNguoi } : null,
    tournament: m.tournament
      ? { id: m.tournament.id, tenGiai: m.tournament.tenGiai }
      : null,
    events: m.events ? m.events.map(toMatchEventResponse) : [],
  };
}

export function toLichSuResponse(r: any) {
  return {
    id: r.id,
    sanBongId: r.sanBong.id,
    soNguoi: r.sanBong.soNguoi,
    nguoiDungName: r.nguoiDung.name,
    ngayDat: toDateOnly(r.ngayDat),
    gioBatDau: r.gioBatDau,
    gioKetThuc: r.gioKetThuc,
    giaTien: decimalToNumber(r.giaTien),
    trangThai: r.trangThai,
  };
}
