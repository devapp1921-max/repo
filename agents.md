# Notes for Codex

- W kolejnych zmianach stylów komponentu `paccordion` należy zawsze używać podbitej specyficzności dla selektorów:
  - `.paccordion__button`
  - `.paccordion__label`
  - `.paccordion__icon`
  - `.paccordion__panel`
  - ich wariantów w breakpointach i stanach (`aria-expanded`, `--startIcon`, itp.).
- Cel: przebijanie reguł o specyficzności 0,3,1 na środowisku testowym bez użycia `!important`.
- Wszystkie zmiany stylów prowadzimy mobile-first: bazowe reguły = mobile, a tablet/desktop tylko w breakpointach.
