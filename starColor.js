export function setStarBlue(star) {
    star.material.color.set(0x66ccff);      // блакитний
    star.material.emissive.set(0x3388ff);   // світіння
    star.material.emissiveIntensity = 1.3;
}
