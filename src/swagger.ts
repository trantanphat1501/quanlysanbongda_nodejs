import { PORT } from './config';

export const openApiDoc = {
  openapi: '3.0.1',
  info: { title: 'QuanLySanBong NodeJS API', version: 'v1' },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    '/api/auth/login': { post: { summary: 'Login', tags: ['Auth'] } },
    '/api/auth/dang-ky': { post: { summary: 'Register user', tags: ['Auth'] } },
    '/api/auth/me': { get: { summary: 'Get current user info', tags: ['Auth'] } },
    '/api/nguoi-dung': { get: { summary: 'List users (admin)', tags: ['NguoiDung'] } },
    '/api/nguoi-dung/search': { get: { summary: 'Search user by phone', tags: ['NguoiDung'] } },
    '/api/nguoi-dung/{id}': {
      get: { summary: 'Get user by ID (admin)', tags: ['NguoiDung'] },
      put: { summary: 'Update user (admin)', tags: ['NguoiDung'] },
      delete: { summary: 'Delete user (admin)', tags: ['NguoiDung'] },
    },
    '/api/san-bong': {
      get: { summary: 'Get pitches', tags: ['SanBong'] },
      post: { summary: 'Create pitch (admin)', tags: ['SanBong'] },
    },
    '/api/san-bong/admin/all': { get: { summary: 'Get all pitches including deleted (admin)', tags: ['SanBong'] } },
    '/api/san-bong/{id}': {
      get: { summary: 'Get pitch detail', tags: ['SanBong'] },
      put: { summary: 'Update pitch (admin)', tags: ['SanBong'] },
      delete: { summary: 'Soft delete pitch (admin)', tags: ['SanBong'] },
    },
    '/api/san-bong/{id}/restore': { put: { summary: 'Restore pitch (admin)', tags: ['SanBong'] } },
    '/api/san-bong/{id}/bao-tri': { put: { summary: 'Toggle maintenance (admin)', tags: ['SanBong'] } },
    '/api/san-bong/{id}/upload-anh': { post: { summary: 'Upload pitch image (admin)', tags: ['SanBong'] } },
    '/api/gia-tien': {
      get: { summary: 'List prices (admin)', tags: ['GiaTien'] },
      post: { summary: 'Create price (admin)', tags: ['GiaTien'] },
    },
    '/api/gia-tien/{id}': {
      get: { summary: 'Get price (admin)', tags: ['GiaTien'] },
      put: { summary: 'Update price (admin)', tags: ['GiaTien'] },
      delete: { summary: 'Delete price (admin)', tags: ['GiaTien'] },
    },
    '/api/hinh-anh/{id}': { delete: { summary: 'Delete image (admin)', tags: ['HinhAnh'] } },
    '/api/lich-su/dat-san': { post: { summary: 'Create booking', tags: ['LichSu'] } },
    '/api/lich-su/my-bookings': { get: { summary: 'My bookings', tags: ['LichSu'] } },
    '/api/lich-su/san/{sanBongId}': { get: { summary: 'Bookings by pitch', tags: ['LichSu'] } },
    '/api/lich-su': { get: { summary: 'All bookings', tags: ['LichSu'] } },
    '/api/lich-su/{id}/status': { put: { summary: 'Update booking status', tags: ['LichSu'] } },
    '/api/teams': {
      get: { summary: 'List teams', tags: ['Team'] },
      post: { summary: 'Create team', tags: ['Team'] },
    },
    '/api/teams/my-teams': { get: { summary: 'My teams', tags: ['Team'] } },
    '/api/teams/my-invitations': { get: { summary: 'My team invitations', tags: ['Team'] } },
    '/api/teams/{id}': {
      get: { summary: 'Get team detail', tags: ['Team'] },
      put: { summary: 'Update team', tags: ['Team'] },
      delete: { summary: 'Delete team', tags: ['Team'] },
    },
    '/api/teams/{teamId}/members': {
      get: { summary: 'List team members', tags: ['Team'] },
      post: { summary: 'Add member to team', tags: ['Team'] },
    },
    '/api/teams/members/{memberId}/status': { put: { summary: 'Update member status', tags: ['Team'] } },
    '/api/teams/members/{memberId}': { delete: { summary: 'Remove member from team', tags: ['Team'] } },
    '/api/teams/{teamId}/register-tournament/{tournamentId}': { post: { summary: 'Register team to tournament', tags: ['Team'] } },
    '/api/tournaments': {
      get: { summary: 'List tournaments', tags: ['Tournament'] },
      post: { summary: 'Create tournament (admin)', tags: ['Tournament'] },
    },
    '/api/tournaments/{id}': {
      get: { summary: 'Get tournament detail', tags: ['Tournament'] },
      put: { summary: 'Update tournament (admin)', tags: ['Tournament'] },
      delete: { summary: 'Delete tournament (admin)', tags: ['Tournament'] },
    },
    '/api/tournament-teams/tournament/{tournamentId}': { get: { summary: 'List teams in tournament', tags: ['TournamentTeam'] } },
    '/api/tournament-teams/{id}/status': { put: { summary: 'Update team registration status (admin)', tags: ['TournamentTeam'] } },
    '/api/tournament-teams/{id}/standing': { put: { summary: 'Update team standing (admin)', tags: ['TournamentTeam'] } },
    '/api/matches/tournament/{tournamentId}': { get: { summary: 'List matches by tournament', tags: ['Match'] } },
    '/api/matches/{id}': {
      get: { summary: 'Get match detail', tags: ['Match'] },
      put: { summary: 'Update match (admin)', tags: ['Match'] },
      delete: { summary: 'Delete match (admin)', tags: ['Match'] },
    },
    '/api/matches': { post: { summary: 'Create match (admin)', tags: ['Match'] } },
    '/api/matches/{id}/status': { put: { summary: 'Update match status (admin)', tags: ['Match'] } },
    '/api/matches/{id}/score': { put: { summary: 'Update match score (admin)', tags: ['Match'] } },
    '/api/matches/{matchId}/events': {
      get: { summary: 'List match events', tags: ['MatchEvent'] },
      post: { summary: 'Create match event (admin)', tags: ['MatchEvent'] },
    },
    '/api/match-events/{id}': {
      put: { summary: 'Update match event (admin)', tags: ['MatchEvent'] },
      delete: { summary: 'Delete match event (admin)', tags: ['MatchEvent'] },
    },
  },
};
