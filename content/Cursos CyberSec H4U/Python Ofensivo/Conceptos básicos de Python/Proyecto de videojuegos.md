----
- Tags: #Python #Repaso 
------
```python
#!/usr/bin/env python3

juegos = ["Super Mario Bros", "Skyrim", "Black Desert", "Escape From Tarkov"]
tope = 100 # Esta variable modifica el tope minimo de ventas para que el sumario muestre la información y la suma de todas las ventas que contengan esta condicion.

# Juegos y Géneros
generos = {
    "Super Mario Bros": "Aventura",
    "Skyrim": "Aventura",
    "Black Desert": "MMORPG",
    "Escape From Tarkov": "FPS",
}

# Ventas y stock
ventas_stock = {
    "Super Mario Bros": (427, 232),
    "Skyrim": (120, 51),
    "Black Desert": (532, 700),
    "Escape From Tarkov": (954, 150)
}

# Clientes
clientes = {
    "Super Mario Bros": {"Marcelo", "Santiago", "Nacho", "Lucas"},
    "Skyrim": {"Leonardo", "Franco", "Matu", "Lucho"},
    "Black Desert": {"Lucho", "Matu", "Santiago", "Rodolfo"},
    "Escape From Tarkov": {"Lucas", "Lauty", "Santiago", "Micaela"},
}


def sumario(juego):

    # Sumario
    print(f"\n[+] Resumen del juego {juego}\n")
    print(f"\t[i] Género del juego: {generos[juego]}")
    print(f"\t[i] Ventas totales del juego: {ventas_stock[juego][0]}")
    print(f"\t[i] Stock restante del juego: {ventas_stock[juego][1]}")
    print(f"\t[i] Clientes que han adquirido el juego: {', '.join(clientes[juego])}") # En este caso usamos ', '.join() para indicar que queremos que cada cliente esté separado por una coma y un espacio.

for juego in juegos:
    if ventas_stock[juego][0] > tope:
        sumario(juego)

ventas_totales = lambda: sum(ventas for juego, (ventas, _) in ventas_stock.items() if ventas_stock[juego][0] > tope)

print(f"\n[+] El total de unidades vendidas para los juegos que superen mas de {tope} ventas es de {ventas_totales()} unidades")
```