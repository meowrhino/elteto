// Azotea. Exterior. Cielo + horizonte + chimeneas. Lugar de fumadores y
// confesiones dramáticas.

export const ROOM_AZOTEA = {
  worldWidth: 480,
  worldHeight: 180,
  bgColor: '#88aacc', // cielo

  // No tiene buildInterior — es exterior. El "suelo" será de hormigón.
  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 60,  y: 134, tex: 'fence' },
    { x: 92,  y: 134, tex: 'fence' },
    { x: 124, y: 134, tex: 'fence' },
    { x: 384, y: 134, tex: 'fence' },
    { x: 416, y: 134, tex: 'fence' },
    { x: 448, y: 134, tex: 'fence' },
    // Una nube cercana
    { x: 200, y: 30,  tex: 'cloud' },
    { x: 320, y: 50,  tex: 'cloud' },
    // Antena/papelera para llenar
    { x: 160, y: 150, tex: 'bin' },
    { x: 360, y: 150, tex: 'bin' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 408, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [],
};
