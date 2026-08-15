export default function Home() {
  return (
    <main className="av-main">
      <section className="av-hero">
        <h1 className="pixel">ARCADE VAULT</h1>
        <p className="sub">
          JUEGA <span className="blink">_</span> COMPITE <span className="blink">_</span> DOMINA EL TOP
        </p>
        <div className="detail-actions" style={{ justifyContent: "center" }}>
          <button className="btn lg pulse">JUGAR AHORA</button>
          <button className="btn magenta lg">VER SALÓN DE LA FAMA</button>
        </div>
      </section>
    </main>
  );
}
