# Rifa Manager

Sistema desenvolvido para gerenciamento de rifas de forma simples e eficiente utilizando **HTML, CSS, JavaScript e Google Sheets como banco de dados**.

## Sobre o Projeto

O objetivo deste projeto é facilitar o controle de vendas de rifas através de uma interface intuitiva para administradores e uma página pública para os participantes.

Todas as informações são armazenadas em uma planilha do Google Sheets, permitindo atualização em tempo real sem a necessidade de um banco de dados tradicional.

## Funcionalidades

### Página Pública

* Visualização dos números disponíveis.
* Visualização dos números já vendidos.
* Atualização automática dos dados.
* Interface simples e responsiva.

### Painel Administrativo

* Cadastro de compradores.
* Registro do número adquirido.
* Atualização instantânea da planilha.
* Controle centralizado das vendas.

## Tecnologias Utilizadas

* HTML5 Tailwind CSS
* JavaScript
* Google Sheets API
* Google Apps Script

## Estrutura do Projeto

```
/
├── index.html          # Página pública
├── admin.html          # Painel administrativo
├── js/
└── assets/
```

## Como Funciona

1. O administrador acessa o painel administrativo.
2. Informa o nome do comprador e o número adquirido.
3. Os dados são enviados para uma planilha do Google Sheets.
4. A página pública consulta a mesma planilha.
5. Os números vendidos e disponíveis são atualizados automaticamente.

## Possíveis Melhorias Futuras

* Pesquisa por nome do comprador.
* Exportação de relatórios.
* Dashboard com métricas de vendas.
* Autenticação de administradores.
* Integração com WhatsApp para confirmação automática.

## Autor

Desenvolvido por Thiago Cortez como projeto de estudo e automação para gerenciamento de rifas.
