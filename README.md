# Hebbian Learning Demo

An interactive neural simulation built from scratch using Vite and the Canvas API. Demonstrates the Hebbian learning rule — the foundational synaptic plasticity mechanism underlying associative memory and networks like the Hopfield model.

## What is Hebbian Learning?

Hebbian learning is a synaptic update rule proposed by Donald Hebb in 1949:

> "Neurons that fire together, wire together."

When two neurons activate simultaneously, the connection between them strengthens. Repeated co-activation leads to strong, stable synaptic links — this is how the brain is thought to encode associations and form memories.

Formally, the weight update rule is:

**Δw_ij = η · x_i · x_j**

Where x_i and x_j are the activations of neurons i and j, and η is the learning rate. This is the same weight matrix update used in the Hopfield network — Hopfield adds an energy function on top of it to define stable memory states.

This simulator makes that process visible in real time: fire two neurons close together in time and watch the synaptic connection between them thicken.

## Features

- 9-neuron fully connected grid rendered on HTML5 Canvas
- Click any neuron to fire it manually
- Background random firing simulates ambient neural activity
- Synaptic weights visualized as lines — thickness and opacity scale with weight strength
- Weight labels update live on each connection
- Weight decay models synaptic pruning — unused connections fade over time
- Interactive sliders for fire rate, learning rate (η), and decay rate
- Live stats: total fires, co-firings, strongest weight

## Install

```bash
git clone https://github.com/ruedaniels/hebbian-learning-demo.git
cd hebbian-learning-demo
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## How to Use

- **Click a neuron** to fire it manually
- **Click two neurons quickly** in succession to trigger co-firing and watch the connection strengthen
- **Fire all neurons** to strengthen every connection simultaneously
- **Adjust sliders** to control how fast weights grow and decay
- **Reset weights** to clear all connections and start fresh

## Controls

| Slider | What it does |
|---|---|
| Random fire rate | How often neurons fire spontaneously |
| Learning rate η | How much each co-firing strengthens a connection |
| Weight decay | How fast unused connections fade |

## How It Works

Each neuron tracks its last fire time. When neuron i fires, it checks every other neuron j — if j fired within the coincidence window (180ms), both neurons are considered co-active and their shared weight updates:

w_ij += η × 1 × 1
w_ij = min(w_ij, 1.0)

On every animation frame, all weights decay slightly:

w_ij -= decay_rate × dt
w_ij = max(w_ij, 0.0)

This balances growth and pruning, keeping the network from saturating.

## Simplifications

- Activations are binary (0 or 1) rather than continuous firing rates
- All connections are symmetric and excitatory — no inhibitory neurons
- No threshold or bias terms on individual neurons
- Coincidence window is fixed rather than spike-timing dependent


## References

- Hebb, D.O. (1949). *The Organization of Behavior*. Wiley & Sons.
- Hopfield, J.J. (1982). Neural networks and physical systems with emergent collective computational abilities. *PNAS*, 79(8), 2554–2558.