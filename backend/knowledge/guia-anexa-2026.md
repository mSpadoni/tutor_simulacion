# Guía Anexa 2026 (cátedra)

> tipo: ejercicio

Fuente: "Simulación — Guía Anexa" 2026 (Prof. Ing. Gladys Alfiero, Prof. Ing. Erica M. Milin, Prof. Ing. Silvia M. Quiroga). Solo enunciados, sin resolución.
Solo están los ejercicios que no figuran en la Guía Anexa resuelta. Los que trabajan por período (cantidades por día o por hora) no se incluyen todavía.

## Ejercicios de la Guía Anexa 2026

### Teatro Barrial

Un cine teatro barrial tiene una boletería atendida por una única persona. Las personas llegan cerca de la hora de cada función según una fdp lineal entre 2 y 4 minutos y arman dos colas: el 20% se ubica en la cola para retiro de entradas y el resto para compra en el momento; cada tipo de atención responde a una fdp conocida y distinta. La boletería atiende dando prioridad a las personas en la cola de retiros de entrada y, cuando no hay gente para retirar, atiende a la otra cola. Se pide calcular el promedio de espera en cola de las personas.

Ejercicio de Cátedra, 2023.

### Dos puestos, una cola de espera

Sistema con dos puestos de atención y una única cola. El puesto uno atiende a dos elementos juntos y el puesto dos solamente atiende de a uno. Se conoce el intervalo entre arribos y el tiempo de atención de cada uno de los puestos.
Se pide determinar el promedio de permanencia en el sistema.

Ejercicio de Cátedra, 2022.

### Salón de ventas

El salón de ventas de una empresa dedicada a la fabricación de pantallas LCD atiende de 9 a 19 hs todos los días de la semana, sólo a clientes mayoristas, y recibe cada veinte días P unidades.
Si se vendieran todas las pantallas antes de cumplirse los veinte días, se programa otra entrega adicional, de una cantidad fija (ADIC), que tarda en llegar un período (DE) determinado por una fdp conocida (expresada en días). Si llega un cliente y no hay suficientes pantallas, se retira sin llevar ningún producto. Las ventas se producen a intervalos (IV) determinados por una fdp (expresada en horas); la cantidad de productos que compra un cliente está dada por tres fdp (CLCD1, CLCD2 y CLCD3) distintas para cada tercio del año.
Se desea determinar la cantidad P de pantallas a transportar hacia el salón de ventas, para minimizar la cantidad de pedidos adicionales y el porcentaje de clientes que se retiran por no encontrar productos suficientes.

Leandro Viegas, 2018.

### Fábrica El Roperito S.A.

La fábrica de indumentaria Roperito S.A. desea determinar la cantidad óptima de remeras que debe producir por lote, con el objetivo de maximizar su beneficio y cubrir los costos de administración del depósito.
Se conoce que el intervalo entre la llegada de cada lote de remeras al depósito, proveniente del sector de producción, responde a una función de densidad de probabilidad (f.d.p.) conocida, expresada en horas.
Los clientes realizan pedidos con una frecuencia cuyo intervalo entre arribos también responde a una f.d.p. conocida (en horas). Asimismo, la cantidad de remeras solicitada en cada pedido sigue otra f.d.p. conocida.
Si un pedido no puede ser satisfecho en su totalidad por falta de stock, pero el depósito dispone de al menos la mitad de la cantidad solicitada, se sabe que el 70% de los clientes acepta llevar la cantidad disponible en stock, considerándose en ese caso como cliente satisfecho. En caso contrario, el cliente no efectúa la compra y se lo clasifica como cliente insatisfecho.
Roperito S.A. desea conocer el porcentaje de clientes que no compraron mercadería por falta de stock y cuál fue la mayor cantidad de remeras faltante en un pedido que causó la cancelación del mismo.

Ejercicio de Cátedra, 2025.

### Vehículos refrigerados y no refrigerados

Una empresa de e-commerce cuenta con un centro de distribución que dispone de vehículos refrigerados y vehículos estándar para realizar entregas.
Los pedidos llegan de forma aleatoria, siguiendo una función de distribución de probabilidad (fdp). El 35% de los pedidos corresponde a productos perecederos, que requieren vehículos refrigerados, mientras que el 65% restante puede transportarse en vehículos estándar.
En el caso de los vehículos refrigerados, si al momento de la llegada de un pedido no hay un vehículo disponible, el pedido se rechaza automáticamente y al cliente se le otorga un vale de descuento.
Cada entrega implica un ciclo completo de servicio, que incluye la salida y el regreso del vehículo al centro de distribución. La duración de este ciclo depende de una fdp específica para cada tipo de vehículo.
No obstante, el cliente percibe como "tiempo de entrega" solo una parte del ciclo completo: se considera que recibe su pedido al cumplirse el 60% del tiempo total del viaje del vehículo. El 40% restante corresponde al trayecto de regreso del vehículo al centro, durante el cual el recurso continúa comprometido y no puede ser asignado a otro pedido.
La empresa desea analizar el comportamiento del sistema ante diferentes cantidades de vehículos de cada tipo con el fin de evaluar el impacto sobre la calidad del servicio. Para ello se propone estudiar:
- El comportamiento de los tiempos de espera de los pedidos de productos no refrigerados para diferentes cantidades de vehículos disponibles.
- El porcentaje de vales de descuento otorgados por falta de disponibilidad de vehículos refrigerados, respecto del total de pedidos recibidos de ese tipo.

Ejercicio de Cátedra, 2025.

### Garage

Un garage del barrio Palermo dispone de un número determinado de cocheras destinadas a clientes por hora/estadía.
Los vehículos llegan al establecimiento siguiendo una fdp para el intervalo entre arribos. El tipo de vehículo puede ser auto (88%) o camioneta (12%).
Cada vehículo permanece estacionado durante un tiempo que responde a una fdp expresada en minutos, solicitada por el cliente al ingresar al garage.
El cliente percibe como tiempo de servicio únicamente el tiempo durante el cual su vehículo permanece estacionado. Sin embargo, una vez que el cliente retira el vehículo, la cochera permanece comprometida durante un 15% adicional del tiempo de estacionamiento, correspondiente a tareas operativas del garage (movimiento de vehículos, registro administrativo y preparación del espacio). Durante ese período la cochera no puede ser asignada a otro cliente.
Si al momento de la llegada de un vehículo no hay cocheras disponibles, el cliente abandona el establecimiento.
Se desea analizar mediante simulación:
- El porcentaje de clientes rechazados por falta de espacio.
- El porcentaje de ocupación de las cocheras para distintas cantidades de espacios disponibles.

Zalazar Martina, 2023.

### Remisería (WhatsApp y agencia, con combustible y revisión técnica)

Una remisería dispone de N autos para brindar servicio de traslado.
Los clientes solicitan vehículos por dos vías: WhatsApp, según una fdp para el intervalo entre solicitudes, y arribo directo a la agencia, según otra fdp para el intervalo entre arribos.
Al recibir una solicitud, la remisería informa al cliente el tiempo hasta que un vehículo quede disponible para atenderlo. La tolerancia de espera de los clientes es: 50% espera hasta 15 minutos, 30% espera hasta 20 minutos y el 20% no espera y decide acudir a otra remisería.
Una vez que el vehículo recoge al pasajero, comienza el viaje, cuya duración responde a una variable aleatoria entre 10 y 30 minutos, donde f(30) = 3·f(10).
Cada vehículo, de manera independiente:
- debe cargar combustible luego de un tiempo de uso dado por una fdp, generando una demora uniforme entre 15 y 30 minutos;
- debe realizar revisión técnica periódica, cuyo intervalo responde a otra fdp y cuya duración es 90 minutos.
Durante estos períodos el vehículo no se encuentra disponible para prestar servicio. Se desea estudiar mediante simulación:
- El tiempo promedio de espera de los clientes.
- El porcentaje de clientes que abandonan el sistema por superar su tolerancia de espera.

Ejercicio de Cátedra, 2020.

### Farmacia que prepara fórmulas magistrales

Una farmacia prepara fórmulas magistrales cuando llega la receta del paciente. Las recetas llegan con una frecuencia que responde a una f.d.p. entre 5 y 12 minutos.
La cantidad de base crema que se utiliza para cada fórmula responde a una f.d.p. entre 80 y 180 gramos por preparado, siendo más probables las cantidades cercanas al centro del intervalo.
Cada preparado tiene un costo fijo administrativo y un costo variable asociado a la cantidad de base utilizada.
La farmacia prepara una cierta cantidad Q de base neutra cada N minutos. Dicha base tiene un costo de $X por kilogramo más un costo fijo de elaboración por lote.
Si la base ya preparada se agota, es necesario elaborar una base urgente en el momento. Esa base tiene un costo mayor por kilogramo y solo se produce lo necesario para completar la fórmula solicitada.
Cada cierto tiempo (fijo) vence o pierde estabilidad el 3% del stock preparado.
Se desea determinar la cantidad de base que conviene preparar y cada cuánto hacerlo, de manera de minimizar los costos.
