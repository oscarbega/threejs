import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        solarSystem: resolve(__dirname, 'solar-system.html'),
        terrain:resolve(__dirname, 'terrains.html'),
        xml:resolve(__dirname, 'osm.html'),
        sagulpa:resolve(__dirname, 'sagulpa.html'),
        tween:resolve(__dirname, 'animation.html'),
        ammo:resolve(__dirname, 'ammo2.html'),
        ammoDemo:resolve(__dirname, 'ammo.html'),
        vr:resolve(__dirname, 'vr.html'),
      },
    },
  },
})