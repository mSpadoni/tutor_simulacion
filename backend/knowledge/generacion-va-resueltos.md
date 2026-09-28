# Generación de variables aleatorias — TP 4 resuelto

Fuente: "TP4 Resuelto" (cátedra). En cada caso: hallar la f.d.p. libre de incógnitas (área = 1), elegir el método más conveniente y obtener la fórmula generadora.
Criterio que usa la cátedra: si F(x) se puede invertir fácil → método de la inversa; si no (polinomios de grado ≥ 2, funciones por tramos) → método del rechazo, con M = máximo de f(x) en el intervalo.

## Generación de variables aleatorias — ejercicios resueltos

### Uniforme f(x) = h entre 5 y 25 (inversa)

- Área: ∫₅²⁵ h dx = 20h = 1 → h = 1/20.
- F(x) = x/20 + c; F(5) = 0 → c = −1/4 → F(x) = x/20 − 1/4.
- Igualando F(x) = R y despejando: **x = 20R + 5**. Método de la inversa.

### Lineal f(x) = mx + 1/2 en (0, 2) (inversa)

- Área: ∫₀² (mx + 1/2) dx = 2m + 1 = 1 → m = 0 → f(x) = 1/2 (es uniforme).
- F(x) = x/2 (F(0) = 0 → c = 0).
- **x = 2R**. Método de la inversa.

### Cuadrática f(x) = x² + a en (0, 1) (rechazo)

- Área: 1/3 + a = 1 → a = 2/3 → f(x) = x² + 2/3.
- F(x) = x³/3 + 2x/3: no se despeja fácil → **método del rechazo** con M = f(1) = 5/3.

### Exponencial f(x) = 5e^(−5x), x ≥ 0 (inversa)

- F(x) = −e^(−5x) + c; F(0) = 0 → c = 1 → F(x) = 1 − e^(−5x).
- 1 − e^(−5x) = R → **x = −ln(1 − R) / 5**. Método de la inversa.

### Parábola f(x) = ax² + bx + c con raíces en 0 y 6 (rechazo)

- f(0) = 0 → c = 0; f(6) = 0 → 36a + 6b = 0 → b = −6a.
- Área: ∫₀⁶ (ax² − 6ax) dx = 72a − 108a = −36a = 1 → a = −1/36, b = 1/6 → f(x) = −x²/36 + x/6 en (0, 6).
- F(x) = −x³/108 + x²/12: no se despeja fácil → **método del rechazo** con M = f(3) = 1/4.

### f(x) = 100/x² para x ≥ 100 (inversa)

- F(x) = −100/x + c; F(100) = 0 → c = 1 → F(x) = 1 − 100/x.
- **x = 100 / (1 − R)**. Método de la inversa.

### Triangular entre 190 y 230 con pico en 210 (rechazo)

- Área del triángulo: (40 · a)/2 = 1 → a = 1/20 (altura máxima, en x = 210).
- Tramo 1, (190, 210): f₁(190) = 0 y f₁(210) = 1/20 → f₁(x) = x/400 − 19/40.
- Tramo 2, (210, 230): f₂(210) = 1/20 y f₂(230) = 0 → f₂(x) = −x/400 + 23/40.
- Función por tramos → **método del rechazo** con M = 0,05.

### f(x) = cos(x) en (0, b) (inversa)

- Área: sen(b) − sen(0) = 1 → b = 90° (π/2).
- F(x) = sen(x) (F(0) = 0 → c = 0).
- **x = arcsen(R)**. Método de la inversa.

### Por tramos: constante en (10, 20) y lineal decreciente en (20, 30) (rechazo)

- f vale h en (10, 20) y baja linealmente de 2h (en x = 20) a h (en x = 30).
- Área: 10h + 10h + 10h/2 = 25h = 1 → h = 1/25.
- f₁(x) = 1/25 en (10, 20); f₂(x) = −x/250 + 4/25 en (20, 30) (f₂(20) = 2/25, f₂(30) = 1/25).
- Función por tramos → **método del rechazo** con M = 2/25.

### Lineal f(x) = (x − 1)/18 en (1, 7) (inversa)

- Área: ∫₁⁷ (x − 1)/18 dx = 36/36 = 1 (ya está libre de incógnitas).
- F(x) = (x − 1)²/36 (F(1) = 0).
- (x − 1)²/36 = R → **x = 6√R + 1**. Método de la inversa.
