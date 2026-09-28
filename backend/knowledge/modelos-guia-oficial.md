# Guía oficial de Trabajos Prácticos 2026 — modelos (ejercicios 1 a 8)

> tipo: modelo

Fuente: "Simulación — Guía de Trabajos Prácticos 2026" (cátedra). Solo enunciados, sin resolución.
Son los **modelos** de la cátedra: la base para entender cómo se arma cada tipo de sistema (1 a 5: colas; 6 a 8: tiempo comprometido). Sirven para explicar teoría ("¿cómo calculo el PTO en tiempo comprometido?") y para saber de qué habla el alumno cuando menciona "el ejercicio N de la guía". No se dan como ejercicio para practicar.
Algunos ejercicios traían gráficos de f.d.p. que no se pudieron pasar a texto (quedan valores sueltos).

## Colas (modelos 1 a 5)

### Ejercicio 1 — Sistema con un puesto de atención, con su correspondiente cola

Los clientes llegan al sistema con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) uniforme entre 0 y 10 minutos.
El tiempo de atención que varía según el trámite entre 10 y 20 minutos, se conoce recién cuando el cliente comienza a ser atendido y responde a una f.d.p. lineal donde f(20)=2*f(10).
Aquellos clientes que al llegar encuentran hasta 4 personas en la cola se quedan, si encuentran hasta 8 se queda sólo el 40% y si encuentran más de 8 se retiran todos.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Resolver las f.d.p. por el método más conveniente.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de espera en cola
Porcentaje de tiempo ocioso del puesto de atención.
Porcentaje de personas que se retiraron porque encontraron a 5 personas en la cola con respecto a todas las arrepentidas.

### Ejercicio 2 — Sistema con dos puestos de atención en paralelo, cada uno con su correspondiente cola

Los clientes llegan al sistema con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) equiprobable entre 0 y 30 minutos y se ubican en la cola con menor cantidad de personas, en caso de igualdad se distribuyen aleatoriamente el 60% a la cola 1 y el 40% a la cola 2.
El tiempo de atención se conoce recién cuando el cliente comienza a ser atendido. Según el trámite varía entre 15 y 35 minutos, y responde a una f.d.p. lineal donde f(35)=3*f(15) (igual para ambos puestos).
Aquellos clientes que al llegar encuentran hasta 2 personas en la cola se quedan, si encuentran 3 personas se queda el 60% y más de 3 el 20%.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Resolver las f.d.p. por el método más conveniente.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema
Promedio de espera en cada cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas que al llegar encontraron más de dos personas por delante en la cola y se quedaron respecto del total de personas atendidas.

### Ejercicio 3 — Sistema con n puestos de atención en paralelo, cada uno con su correspondiente cola

Los clientes que llegan al sistema se ubican en la cola con la menor cantidad de gente y en caso de igualdad se ubican siempre en la última cola (n).
Todos los clientes están dispuestos a esperar si encuentran hasta 5 personas por delante en la cola, sólo el 20% espera si encuentra hasta 8, el resto se retira.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido recién cuando el cliente comienza a ser atendido.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema
Promedio de espera en cada cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas arrepentidas respecto del total de personas que ingresaron al sistema.

### Ejercicio 4 — Sistema con n puestos de atención en paralelo, con UNA ÚNICA COLA

Los clientes que llegan al sistema se ubican en la única cola.
Todos los clientes están dispuestos a esperar si encuentran hasta 10 personas por delante en la cola, sólo el 40% espera si encuentra hasta 20, el resto se retira.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido recién cuando el cliente comienza a ser atendido.
Se pide:
d) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de espera en cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas arrepentidas respecto del total de personas que ingresaron al sistema.

### Ejercicio 5 — Sistema con 2 puestos de atención en paralelo, cada puesto con diferentes prioridades…

Sistema con 2 puestos de atención en paralelo, cada puesto con diferentes prioridades de atención.
Los clientes que llegan al sistema se ubican en la cola del puesto “A” ó “B” según la siguiente distribución, el 35% se ubica en la cola “A” y el 65% en la cola “B”.
Todos los clientes están dispuestos a esperar.
El puesto de atención “B” atiende a una persona que este haciendo la cola en su puesto solamente si no hay personas esperando ser atendidas en el puesto “A”, o sea que las personas que están haciendo la cola en “A” tienen mayor prioridad que las del puesto “B”.
El puesto de atención “A” atiende solamente a las personas que estén haciendo la cola en su puesto.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido recién cuando el cliente comienza a ser atendido.
Se pide:
g) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de espera en cola
Porcentaje de tiempo ocioso de cada puesto de atención.

## Tiempo comprometido (modelos 6 a 8)

### Ejercicio 6 — Sistema con un puesto de atención

Los clientes llegan al sistema con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) equiprobable entre 5 y 20 minutos.
El tiempo de atención se conoce desde la llegada del cliente al sistema y responde a una función normal de Gauss, entre 10 y 20 minutos.
Todos los clientes están dispuestos a esperar hasta 10 minutos, sólo el 60% espera entre 10 y 20 minutos y el 10% espera más de 20 minutos.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de tiempo de atención.
Promedio de espera en cola
Porcentaje de tiempo ocioso del puesto de atención.
Porcentaje de personas que tuvieron que esperar más de 15 minutos antes de ser atendidas.
Porcentaje de personas que tenían que esperar más de 20 minutos y se retiraron con respecto al total de personas arrepentidas.

### Ejercicio 7 — Sistema con dos puestos de atención en paralelo

Los clientes llegan con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) equiprobable entre 3 y 15 minutos y se ubican en la cola donde serán atendidos antes, en caso de igualdad se distribuyen cíclicamente 3 a la cola 1 y 4 a la cola 2.
El tiempo de atención se conoce desde la llegada, es el mismo para ambos puestos y responde a una f.d.p. del tipo f(x) = [4-(x-4)2 ]/k.
Aquellos clientes que al llegar deben esperar hasta 10 minutos se quedan, sólo el 50% espera hasta 25 minutos, el resto se retira.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Resolver las f.d.p. por el método más conveniente.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema
Promedio de espera en cada cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas que al llegar tuvieron que esperar más de 20 minutos y se quedaron respecto del total de personas atendidas.

### Ejercicio 8 — Sistema con n puestos de atención en paralelo

Los clientes que llegan se ubican en la cola donde serán atendidos antes y en caso de igualdad se ubican siempre en la primera cola.
Todos los clientes están dispuestos a esperar el tiempo necesario hasta ser atendido.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido desde la llegada del cliente al sistema que responde a f(x) = [4-(x-4)2 ]/k.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema.
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas que tuvieron que esperar mas de 20 minutos antes de ser atendidas.
