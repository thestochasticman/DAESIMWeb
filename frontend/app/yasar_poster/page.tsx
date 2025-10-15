"use client";

export default function YasarPoster() {
  return (
    <div className="poster-wrap">
      <style>{`
        :root {
          --bg: #0a0a0a;
          --poster: #0a0a0a;
          --cyan: #18dfdfff;
          --cyan2: #18dfdfff;
          --green: #056b2aff;
          --ink: #ffffff;
          --muted: #9ca3af;
          --gap: 8mm;
          --margin: 18mm;
          --border: #6b7280; /* 🩶 neutral grey border color */
          --red: #c52222ff;
        }

        * { box-sizing: border-box; }

        html, body {
          height: 100%;
          margin: 0;
          background: var(--bg);
          color: var(--ink);
          font-family: Inter, system-ui, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .poster-wrap {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg);
          padding: 0;
          margin: 0;
          overflow: hidden;
        }

        .poster {
          background: var(--poster);
          width: 100vw;
          height: 100vh;border
          // border: 0.8vh solid var(--border);
          // box-shadow: 0 0 80px rgba(93, 172, 172, 0.4);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .poster-inner {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding: 3vh 4vw;
          overflow-y: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 4px solid var(--border);
          padding-bottom: 2vh;
        }

        .title {
          font-family: Poppins, Inter, sans-serif;
        }

        .title .kicker {
          font-weight: 600;
          font-size: 1.5rem;
          color: var(--green);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .title h1 {
          margin: 0;
          font-size: 3.5rem;
          font-weight: 800;
          // color: var(--green);
          text-shadow: none
        }

        .meta {
          text-align: right;
          color: var(--muted);
          font-size: 1rem;
        }

        .hero {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          margin-top: 4vh;
          font-size: 2rem

        }

        .abstract {
          background: rgba(0,255,255,0.08);
          border-left: 6px solid var(--border);
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
        }

        .abstract h2 {
          color: var(--cyan);
          margin-bottom: 0.5rem;
          font-size: 1.8rem;
        }

        .keypoints {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .badge {
          background: rgba(34,197,94,0.1);
          border-left: 6px solid var(--green);
          padding: 0.8rem 1.2rem;
          border-radius: 0.5rem;
          font-size: 2.1rem;
        }

        .body {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 4vh;
        }

        .card {
          border: 1px solid rgba(255,255,255,0.2);
          background: #0a0a0a;
          border-radius: 0.8rem;
          padding: 1.5rem;
        }

        .card h3 {
          font-family: Poppins, Inter, sans-serif;
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 1.8rem;
          color: var(--cyan2);
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 0.5rem;
        }

        .figure {
          text-align: center;
          margin-top: 1rem;
        }

        .figure img {
          max-width: 100%;
          border: 2px solid var(--grey);
          border-radius: 0.5rem;
          // box-shadow: 0 0 20px rgba(0,255,255,0.2);
        }

        .caption {
          font-size: 0.9rem;
          color: var(--muted);
          margin-top: 0.5rem;
        }

        .footer {
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 1rem;
          margin-top: 2rem;
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--muted);
        }

        @media print {
          @page { size: A0 portrait; margin: 0; }
          body { background: #000 !important; color: #fff !important; }
          .poster { box-shadow: none; border: none; }
        }
      `}</style>

      <div className="poster" id="poster">
        <div className="poster-inner">
          <header className="header">
            <div className="title">
              <div className="kicker">DAESIM: Dynamic Agro Ecosystem SIMulator</div>
              <h1>CROP MANAGEMENT USING BIO PHYSICAL MODEL</h1>
            </div>
            <div className="meta">
              <div><strong>Yasar Adeel Ansari</strong> · ANU Borevitz Labs</div>
              <div>Yasar.Ansar@anu.edu.au · Canberra, Australia</div>
              <div>Updated: 9 Oct 2025</div>
            </div>
          </header>

          <section className="hero">
            <article className="abstract">
              <h2>Abstract</h2>
              <p>
                The school of RSB has developed a biophysical model that simulates the growth of a given crop under diverse environmental conditions.
                The model leverages first principles of physics and plant physiology to capture crop development. With this project,
                the model is scaled for deployment across Australia. And is currently being calibrated to provide accurate estimates for the very
                diverse conditions of Australia. Our goal is for this to be a tool that helps people decide "What to grow, when to grow it and how to go about
                growing it."
              </p>
            </article>

            <aside className="keypoints">
              <div className="badge">
                <strong>DATA INTEGRATION</strong>
              </div>
              <div className="badge">
                <strong>PRE PROCESSING</strong>
              </div>
              <div className="badge">
                <strong>MATHEMATICAL MODELING</strong>
              </div>
              <div className="badge">
                <strong>LARGE SCALE SIMULATION RUNS</strong>
              </div>
              <div className="badge">
                <strong>FRONT END DEVELOPMENT</strong>
              </div>
              <div className="badge">
                <strong>DOCKER CONTAINERISATION</strong>
              </div>
            </aside>
          </section>

          <main className="body">
            {/* <article className="card"
            style={{
                        gridColumn: "span 2",
                        height: "200mm",
                        background: "rgba(0,0,0,0.8)",
                        border: "1mm solid rgba(0,255,255,0.4)",
                        borderRadius: "8mm",
                        overflow: "hidden",
                    }}
            >
                
              <h3>Growth Stages  </h3>
              <p>
                   
              </p>
              <div className="figure">
                <img src="/static/images/paddock_map.png" alt="Map" />
                <div className="caption">Spatial distribution of paddocks.</div>
              </div>
            </article> */}

            {/* <article
                className="card"
                style={{
                    gridColumn: "span 1",
                    height: "110mm",
                    background: "rgba(0,0,0,0.8)",
                    border: "1mm solid rgba(0,255,255,0.4)",
                    borderRadius: "8mm",
                    overflow: "hidden",
                }}
                >
                <h3>Study Growth Stages</h3>

                <ul
                style={{
                    marginLeft: "0",
                    paddingLeft: "0",
                    lineHeight: 1.6,
                    fontSize: "20pt",
                    listStyle: "none",
                }}
                >
                <li style={{ color: "#00ffff", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌱</span> <strong>Sowing</strong>
                </li>

                <li style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌿</span> <strong>Start of Vegetative</strong>
                </li>

                <li style={{ color: "#facc15", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌸</span> <strong>Flowering</strong>
                </li>

                <li style={{ color: "#fb923c", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌾</span> <strong>Grain Filling</strong>
                </li>

                <li style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🍂</span> <strong>Maturity</strong>
                </li>

                <li style={{ color: "#a855f7", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🚜</span> <strong>Harvest</strong>
                </li>
                </ul>


            </article> */}


            {/* <article className="card">
              <h3>2 · Methodology</h3>
              <p>
                DAESIM integrates environmental inputs with plant physiological submodels.
              </p>
              <div className="figure">
                <img src="/static/images/methods-figure.png" alt="Pipeline" />
                <div className="caption">System pipeline for simulation.</div>
              </div>
            </article> */}
            

             <article
                className="card"
                style={{
                    gridColumn: "span 2",
                    height: "140mm",
                    background: "#0a0a0a",
                    border: "1mm solid var(--border)",
                    borderRadius: "8mm",
                    overflow: "hidden",
                }}
                >
                <h3>Bio Mass of stem, root, seed, and leaves over time</h3>

                {/* <ul
                style={{
                    marginLeft: "0",
                    paddingLeft: "0",
                    lineHeight: 1.6,
                    fontSize: "20pt",
                    listStyle: "none",
                }}
                > */}
                {/* <li style={{ color: "#00ffff", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌱</span> <strong>Sowing</strong>
                </li>

                <li style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌿</span> <strong>Start of Vegetative</strong>
                </li>

                <li style={{ color: "#facc15", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌸</span> <strong>Flowering</strong>
                </li>

                <li style={{ color: "#fb923c", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🌾</span> <strong>Grain Filling</strong>
                </li>

                <li style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🍂</span> <strong>Maturity</strong>
                </li>

                <li style={{ color: "#a855f7", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🚜</span> <strong>Harvest</strong>
                </li>
                </ul> */}
                <div className="figure">
                <img src="carbon_allocation.png" alt="Pipeline" />
                {/* <div className="caption">System pipeline for simulation.</div> */}
              </div>

            </article>

            <article className="card"

            style={{
                    gridColumn: "span 3",
                    height: "140mm",
                    background: "#0a0a0a",
                    border: "1mm solid var(--border)",
                    borderRadius: "8mm",
                    overflow: "hidden",
                }}
            
            >
              <h3>Some features and use cases</h3>
                <ul
                style={{
                    marginLeft: "0",
                    paddingLeft: "0",
                    lineHeight: 1.6,
                    fontSize: "20pt",
                    listStyle: "none",
                }}
                >
                <li>
                    1. Simulate the growth of Wheat and Canola cultivars across any site in Australia.
                </li>

                <li>
                    2. Generate environment from location or provide custom environment.
                </li>

                <li>
                    3. Study processes like transpiration, photosynthesis, carbon allocation, etc
                </li>


                <li>
                    4. Plan ahead by getting tentative harvest and sowing date.
                </li>

                <li>
                    5. Don't have to focus on maximising yield everytime. This model can help
                    the user choose a crop that might mature faster while giving decent yield. The
                    user could then beat their competitors to the market.  
                </li>

                <li>
                  6. This poster itself is hosted on http://130.56.246.157/DAESIM/yasar_poster
                </li>

                <li>
                  7. The model can be run from http://130.56.246.157/DAESIM/
                </li>

                <li>
                  8. PaddockTS is one of the data integration and packages we had to build
                    to deploy DAESIM. It was mainly created to create ground truth for time of
                    growth stages for different crops. For the calibration of DAESIM.
                </li>

                </ul>
            </article>

            <article className="card"

            style={{
                    gridColumn: "span 3",
                    height: "140mm",
                    background: "#0a0a0a",
                    border: "1mm solid var(--border)",
                    borderRadius: "8mm",
                    overflow: "hidden",
                }}
            
            >
              <h3>Research Goals</h3>
                <ul
                style={{
                    marginLeft: "0",
                    paddingLeft: "0",
                    lineHeight: 1.6,
                    fontSize: "20pt",
                    listStyle: "none",
                }}
                >
                <li>
                    1. Sensitivity Analysis to identify key parameters for calibration.
                </li>

                <li>
                    2. Calibrate the model for different cultivars across different sites.
                </li>
                    3. By simulating the future environment using markov simulations,
                       We can allocate land to grow multiple crops where each crop acts as a hedge to the other.
                </ul>
            </article>


            {/* <article className="card">
              <h3>5 · Conclusion</h3>
              <p>
                DAESIMWeb bridges advanced crop modeling with accessible web interfaces.
              </p>
            </article> */}
            
            

        

            <article
                    className="card"
                    style={{
                        gridColumn: "span 6",
                        height: "400mm",
                        background: "#0a0a0a",
                        border: "1mm solid var(--border)",
                        borderRadius: "8mm",
                        overflow: "hidden",
                    }}
                    >
                    <h3
                        style={{
                        color: "var(--cyan2)",
                        textAlign: "center",
                        marginBottom: "8mm",
                        }}
                    >
                        Live DAESIM Simulation Dashboard
                    </h3>

                    <iframe
                        src="/DAESIM/results/test_2"
                        style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        backgroundColor: "#0a0a0a",
                        transform: "scale(0.9)",
                        transformOrigin: "top center",
                        }}
                        title="DAESIM App"
                    />
            </article>

                        <article
                    className="card"
                    style={{
                        gridColumn: "span 2",
                        height: "400mm",
                        background: "#0a0a0a",
                        border: "1mm solid var(--border)",
                        borderRadius: "8mm",
                        overflow: "hidden",
                    }}
                    >
                    <h3
                        style={{
                        color: "var(--cyan2)",
                        textAlign: "center",
                        marginBottom: "8mm",
                        }}
                    >
                        Live Paddock Segmentation
                    </h3>

                    <iframe
                        src="/PaddockTS/results/1"
                        style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        backgroundColor: "#0a0a0a",
                        transform: "scale(0.9)",
                        transformOrigin: "top center",
                        }}
                        title="DAESIM App"
                    />
            </article>
          </main>
          <footer className="footer">
            <div>
              <strong>Project:</strong> 130.56.246.157/DAESIM/yasar_poster
            </div>
            <div>License: CC BY 4.0</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
