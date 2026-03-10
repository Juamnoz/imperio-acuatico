import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Imperio Acuático — Peces Ornamentales y Accesorios'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1a1d 0%, #0d2428 40%, #0D7377 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(13, 115, 119, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(13, 115, 119, 0.1)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: -2,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Imperio Acuático
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#0D7377',
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            Peces Ornamentales & Accesorios
          </div>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: 'rgba(13, 115, 119, 0.3)',
                borderRadius: 12,
                padding: '10px 20px',
                color: '#7dd3d5',
                fontSize: 18,
              }}
            >
              +1.000 especies
            </div>
            <div
              style={{
                background: 'rgba(13, 115, 119, 0.3)',
                borderRadius: 12,
                padding: '10px 20px',
                color: '#7dd3d5',
                fontSize: 18,
              }}
            >
              Pre-desparasitados
            </div>
            <div
              style={{
                background: 'rgba(13, 115, 119, 0.3)',
                borderRadius: 12,
                padding: '10px 20px',
                color: '#7dd3d5',
                fontSize: 18,
              }}
            >
              Envíos a todo Colombia
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 16,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Caldas, Antioquia · WhatsApp 302 747 1832
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
