# Known Limitations & Future Scope

[← Back to README](../README.md)

## What Doesn't Work Yet

| Limitation | Why it exists | What we'd do next |
|---|---|---|
| Ward/jurisdiction boundaries are approximate for the current demo coverage | The MVP does not yet use an official MCC/KGIS ward GIS boundary layer | Integrate official Mysuru ward and jurisdiction GIS data and use it for production-grade routing |
| Demo reporting location can use a clearly labelled fallback/manual location when device GPS is unavailable | Browser GPS availability, permissions, and accuracy vary across devices and environments | Improve location acquisition and integrate production mapping/GIS services |
| The submitted MVP does not provide full city-wide government-system integration | The hackathon scope focused on demonstrating the civic accountability workflow end-to-end | Integrate with official municipal complaint, ward-office, and operational systems |
| AI is not used at runtime | The MVP was intentionally designed to operate without a runtime AI dependency | Add optional provider-independent AI verification/duplicate assistance after the core civic workflow is established |
| The current deployment is validated at demo scale rather than through a production load test | The project was built and tested within the hackathon time constraint | Perform load testing and optimize database queries, realtime delivery, storage, and map rendering before city-wide deployment |

## Edge Cases We Don't Handle Completely

- GPS spoofing or deliberately falsified device locations cannot be completely prevented by the current web application.
- Multiple reports describing the same physical issue may still require manual handling in cases where evidence is insufficient to establish that they are duplicates.
- Poor GPS accuracy, denied permissions, unavailable location services, or weak connectivity can require manual location selection or fallback behaviour.
- Malicious or misleading evidence cannot be completely eliminated by the current MVP and may require stronger moderation and verification workflows.
- Very large numbers of simultaneous reports, realtime events, or map markers have not been validated under production-scale load.
- Advanced automated duplicate detection, evidence analysis, and AI-assisted verification remain future enhancements rather than runtime dependencies of the submitted MVP.

## Scaling to All of Mysuru

<!-- Expands Decision Log Q3. Keep the two consistent. -->

| What breaks first | Rough numbers | Fix |
|---|---|---|
| Client-side map rendering and report loading | Current demo is validated with 53 seeded reports; production thresholds have not been load-tested | Use server-side pagination, viewport/bounding-box queries, marker clustering, and aggregated map data |
| Realtime event volume | No production concurrency benchmark has been performed | Add event filtering, scoped subscriptions, batching where appropriate, and backend monitoring |
| Evidence storage and delivery | Current MVP supports evidence metadata and uploaded media, but long-term storage volume has not been benchmarked | Use storage lifecycle policies, optimized media sizes, thumbnails, CDN delivery, and retention rules |
| Operational workload across wards | Current implementation demonstrates the workflow but has not been tested with city-wide municipal staffing levels | Add ward-level queues, workload assignment, escalation rules, SLA monitoring, and operational analytics |

## Roadmap

1. Integrate official MCC/KGIS ward boundaries and production-grade jurisdiction routing.
2. Pilot the workflow with a real ward office and validate the citizen → municipal/NGO → verification lifecycle using real operational feedback.
3. Add Kannada and multilingual reporting, including Kannada-friendly evidence and form flows.
4. Add stronger duplicate-report detection, GPS/evidence abuse detection, and moderation workflows.
5. Add optional AI-assisted evidence verification without making runtime AI a core dependency.
6. Add push notifications, richer ward analytics, advanced heatmaps, and city-wide operational monitoring.
7. Perform production load, security, accessibility, and reliability testing before large-scale Mysuru deployment.
