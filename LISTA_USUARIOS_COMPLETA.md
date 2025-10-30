# 📋 Lista Completa de 40 Usuarios Generados

**Password para TODOS:** `password123`

---

| # | Nombre | Email | DNI | Teléfono |
|---|--------|-------|-----|----------|
| 01 | Pablo Álvarez | pablo.alvarez852@outlook.com | 90538055 | +57 322 595 8287 |
| 02 | Juan Martínez | juan.martinez438@gmail.com | 62045611 | +57 319 436 5246 |
| 03 | Laura Hernández | laura.hernandez587@gmail.com | 62463859 | +57 341 757 9394 |
| 04 | Andrea Ramírez | andrea.ramirez436@yahoo.com | 53181414 | +57 322 281 3646 |
| 05 | Pablo Ramírez | pablo.ramirez80@yahoo.com | 38948563 | +57 300 902 5735 |
| 06 | Marta Hernández | marta.hernandez143@outlook.com | 19576794 | +57 307 236 5356 |
| 07 | Daniel Vega | daniel.vega240@hotmail.com | 97958419 | +57 345 768 5977 |
| 08 | Alberto Rodríguez | alberto.rodriguez289@hotmail.com | 39388071 | +57 318 768 4023 |
| 09 | Francisco Torres | francisco.torres191@yahoo.com | 93036466 | +57 303 484 1778 |
| 10 | Carlos Morales | carlos.morales147@hotmail.com | 64147306 | +57 331 755 8994 |
| 11 | Manuel Ortiz | manuel.ortiz83@hotmail.com | 74518225 | +57 313 587 6549 |
| 12 | Marta Herrera | marta.herrera286@gmail.com | 34637909 | +57 316 762 4208 |
| 13 | Raúl Ortiz | raul.ortiz126@outlook.com | 12639078 | +57 345 976 1885 |
| 14 | Victoria Romero | victoria.romero648@hotmail.com | 10680940 | +57 328 819 8734 |
| 15 | Ana Hernández | ana.hernandez682@hotmail.com | 35197034 | +57 348 792 9070 |
| 16 | Carlos González | carlos.gonzalez390@yahoo.com | 50847119 | +57 304 709 4349 |
| 17 | Daniel Álvarez | daniel.alvarez747@hotmail.com | 11150069 | +57 347 274 2079 |
| 18 | Ana Rivera | ana.rivera629@yahoo.com | 21678600 | +57 314 825 4390 |
| 19 | Roberto Rodríguez | roberto.rodriguez385@outlook.com | 36255768 | +57 340 897 3795 |
| 20 | Silvia Díaz | silvia.diaz411@hotmail.com | 72942307 | +57 326 703 7336 |
| 21 | Pablo Gutiérrez | pablo.gutierrez684@yahoo.com | 55610376 | +57 303 755 4304 |
| 22 | Jorge Romero | jorge.romero920@outlook.com | 68831776 | +57 319 433 2357 |
| 23 | Carlos Fernández | carlos.fernandez523@gmail.com | 98145963 | +57 314 266 2884 |
| 24 | Sergio Rodríguez | sergio.rodriguez855@gmail.com | 77671028 | +57 317 970 3257 |
| 25 | Gabriela González | gabriela.gonzalez875@outlook.com | 29738888 | +57 315 342 9021 |
| 26 | Cristina Gutiérrez | cristina.gutierrez848@gmail.com | 49988246 | +57 301 650 9213 |
| 27 | Victoria Gutiérrez | victoria.gutierrez298@hotmail.com | 77663478 | +57 345 535 6952 |
| 28 | Marta Rodríguez | marta.rodriguez660@yahoo.com | 51875977 | +57 341 610 3992 |
| 29 | Natalia Castro | natalia.castro194@outlook.com | 88903707 | +57 327 315 1305 |
| 30 | Manuel Martínez | manuel.martinez510@gmail.com | 14658786 | +57 302 649 3682 |
| 31 | Raúl Romero | raul.romero949@hotmail.com | 28013308 | +57 336 330 3736 |
| 32 | Cristina Castillo | cristina.castillo311@outlook.com | 45732037 | +57 307 147 5237 |
| 33 | Sofía Ramos | sofia.ramos231@yahoo.com | 89477004 | +57 301 187 1594 |
| 34 | Cristina Martínez | cristina.martinez335@gmail.com | 77982126 | +57 350 872 7979 |
| 35 | Francisco Vargas | francisco.vargas456@hotmail.com | 34810568 | +57 340 683 8790 |
| 36 | Jorge Díaz | jorge.diaz536@gmail.com | 41292602 | +57 337 552 9124 |
| 37 | María Gómez | maria.gomez164@gmail.com | 77230791 | +57 330 408 7881 |
| 38 | Pablo Medina | pablo.medina882@outlook.com | 69220072 | +57 343 751 4090 |
| 39 | Adriana Pérez | adriana.perez960@hotmail.com | 88074362 | +57 349 754 4374 |
| 40 | Juan Jiménez | juan.jimenez342@gmail.com | 90853982 | +57 300 291 3426 |

---

## ✅ Corrección Aplicada

**Problema resuelto:** Los emails anteriores contenían caracteres con tildes (á, é, í, ó, ú) que causaban errores de validación en el formulario de login.

**Solución:** Se regeneraron todos los usuarios con emails sin tildes. Los nombres SÍ mantienen las tildes (Pablo Álvarez, Raúl Ortiz, etc.), pero los emails son completamente compatibles con validadores estándar.

**Ejemplos de emails válidos:**
- ✅ pablo.alvarez852@outlook.com (nombre con tilde → email sin tilde)
- ✅ juan.martinez438@gmail.com
- ✅ raul.ortiz126@outlook.com (Raúl → raul)
- ✅ sofia.ramos231@yahoo.com (Sofía → sofia)

---

## 🚀 Usar en la Aplicación

1. Ir a http://localhost:3000
2. Usar cualquier email de la lista
3. Password: `password123`
4. ¡Listo!

---

**Nota:** Si necesitas regenerar los datos, ejecuta:
```bash
docker exec empenio-backend-1 node seed-40-usuarios.js
```
