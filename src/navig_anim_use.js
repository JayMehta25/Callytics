import GooeyNav from './GooeyNav'

// update with your own items
const items = [
  { label: "Home", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

<div style={{ height: '600px', position: 'relative' }}>
  <GooeyNav
    items={items}
    animationTime={600}
    pCount={15}
    minDistance={20}
    maxDistance={42}
    maxRotate={75}
    colors={[1, 1, 1, 1, 1, 1, 1, 1]}
    timeVariance={300}
  />
</div>