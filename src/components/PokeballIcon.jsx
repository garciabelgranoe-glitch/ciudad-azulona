export default function PokeballIcon({ size = 18 }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full border-2 border-ink"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(180deg, #E05B3D 0 48%, #20291C 48% 52%, #FBF7EC 52% 100%)",
      }}
    />
  );
}
