package com.gasvolcan.pedidos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Misma forma que la dirección que arma el Checkout de React. */
@Embeddable
public class DireccionEntrega {

    @Column(name = "calle", nullable = false, length = 150)
    private String calle;

    @Column(name = "numero_calle", nullable = false, length = 6)
    private String numeroCalle;

    /** "casa" o "departamento" */
    @Column(name = "tipo_vivienda", nullable = false, length = 20)
    private String tipo;

    @Column(name = "depto", length = 30)
    private String depto;

    @Column(name = "region", nullable = false, length = 100)
    private String region;

    @Column(name = "comuna", nullable = false, length = 100)
    private String comuna;

    @Column(name = "indicaciones", length = 300)
    private String indicaciones;

    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }

    public String getNumeroCalle() { return numeroCalle; }
    public void setNumeroCalle(String numeroCalle) { this.numeroCalle = numeroCalle; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDepto() { return depto; }
    public void setDepto(String depto) { this.depto = depto; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getComuna() { return comuna; }
    public void setComuna(String comuna) { this.comuna = comuna; }

    public String getIndicaciones() { return indicaciones; }
    public void setIndicaciones(String indicaciones) { this.indicaciones = indicaciones; }
}
