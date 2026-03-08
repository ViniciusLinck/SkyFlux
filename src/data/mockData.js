export const MOCK_TLE_TEXT = `STARLINK-DEMO-001
1 25544U 98067A   26067.52710067  .00012225  00000+0  22384-3 0  9991
2 25544  51.6434 143.7639 0004798 195.2869 224.8606 15.49187280452182
STARLINK-DEMO-002
1 40967U 15058A   26067.45197120  .00000458  00000+0  16174-3 0  9994
2 40967  97.4435 127.6867 0012694 170.9467 189.2016 15.21548083565528
STARLINK-DEMO-003
1 33591U 09005A   26067.44684331  .00000215  00000+0  94363-4 0  9990
2 33591  98.1708 357.0408 0001325 102.5857 257.5464 14.57114638913347
STARLINK-DEMO-004
1 25338U 98030A   26067.54814154  .00000135  00000+0  79788-4 0  9992
2 25338  98.7278 154.8391 0012271 184.0554 176.0488 14.25904954447286
STARLINK-DEMO-005
1 43013U 17073A   26067.40540975  .00000161  00000+0  66097-4 0  9996
2 43013  97.4998 123.2566 0009951  87.3035 272.9508 15.22976706457006`

export const MOCK_LAUNCHES = [
  {
    id: 'demo-launch-1',
    name: 'Falcon 9 Demo Starlink',
    date_utc: '2026-06-11T18:00:00.000Z',
    success: null,
    details: 'Missao demonstrativa para o modo offline da plataforma.',
    launchpad: 'demo-pad-1',
  },
  {
    id: 'demo-launch-2',
    name: 'Falcon Heavy Cargo Demo',
    date_utc: '2026-07-19T20:10:00.000Z',
    success: null,
    details: 'Carga orbital de teste para visualizacao de trajetoria.',
    launchpad: 'demo-pad-2',
  },
]

export const MOCK_LAUNCHPADS = [
  {
    id: 'demo-pad-1',
    name: 'Cape Canaveral SLC-40',
    locality: 'Cape Canaveral',
    region: 'FL',
    latitude: 28.5618571,
    longitude: -80.577366,
  },
  {
    id: 'demo-pad-2',
    name: 'Kennedy LC-39A',
    locality: 'Merritt Island',
    region: 'FL',
    latitude: 28.608389,
    longitude: -80.604333,
  },
]

export const MOCK_APOD = {
  date: '2026-03-08',
  title: 'Deep Sky Placeholder',
  explanation:
    'A API APOD nao respondeu no momento. Este painel entrou em modo demonstracao e sera atualizado automaticamente quando a conexao voltar.',
  media_type: 'image',
  url: 'https://images-assets.nasa.gov/image/PIA12235/PIA12235~orig.jpg',
  hdurl: 'https://images-assets.nasa.gov/image/PIA12235/PIA12235~orig.jpg',
}
