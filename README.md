# Twists n Turns 

**Número da Lista**: 17

**Conteúdo da Disciplina**: Final 

## Alunos

|Matrícula | Aluno |
| -- | -- |
| 20/0019015 | Guilherme Puida Moreira |
| 19/0118288 | Vitor Eduardo Kühl Rodrigues |

## Sobre 

O projeto tem como objetivo demonstrar, de maneira interativa, diversos
algoritmos de geração de labirintos. O projeto engloba temas de grafos,
algoritmos ambiciosos e dividir e conquistar.

Para gerar os labirintos, os seguintes algoritmos foram implementados:

- Binary Tree;
- Sidewinder;
- Hunt and Kill;
- Recursive Backtracker:
- Kruskal;
- Prims;
- Recursive Division;

Todos os algoritmos são animados, mostrando as etapas necessárias para gerar o
labirinto final. Além disso, também é possível encontrar o menor caminho entre
duas posições predefinidas:

- Canto superior esquerdo -> canto inferior direito (botão `encontrar
  caminho`).
- Canto inferior esquerdo -> canto superior direito (botão `outro caminho`).

**Observação**: A geração do labirinto pode ser devagar. Isso se deve ao fato
de que a animação é gerada por completo, e depois exibida. Para evitar que a
interface ficasse congelada durante a geração do lambirinto, o algoritmo
selecionado é executado em um _Web Worker_.

## Screenshots

![image 1](/media/image-1.png)
![image 1](/media/image-2.png)
![image 1](/media/image-3.png)

O vídeo pode ser encontrado [aqui](/media/final.mp4).

## Instalação 

**Linguagem**: Javascript 

Para executar o projeto, use algum servidor de arquivos estáticos. Não abra
diretamente o arquivo `index.html`, já que o código em Javascript não será
carregado.

Como exemplo, utilizando o servidor HTTP imbutido no Python 3, execute:

```sh
$ git clone https://github.com/projeto-de-algoritmos/Final_twists-n-turns
$ cd Final_twists-n-turns
$ python -m http.server 9000
```

E acesse `localhost:9000` no Chrome/Edge/Brave/etc.

Como o projeto utiliza web-workers, somente navegadores baseados no Chromium são suportados.

O projeto também pode ser acessado em [https://twists-n-turns.puida.xyz](https://twists-n-turns.puida.xyz)

## Uso 

Na página do projeto, alguns botões estão disponíveis:

- **Seleção de algoritmo**: Inicialmente vazio, mas contém os algoritmos
  implemetados. Selecione o algoritmo que deseja visualizar, e a animação será
  automaticamente gerada e aparecerá na área cinza abaixo.
- **Limpar**: Limpa o labirinto.
- **Encontrar Caminho**: Encontra o menor caminho entre o canto superior
  esquerdo e o canto inferior direito.
- **Outro caminho**: Encontra o menor caminho entre o canto inferior esquerdo e
  o canto superior direito.

Quando um algoritmo é selecionado, mais informações sobre ele aparecerão na
parte direita da tela.

Estatísticas sobre o tempo de de execução do algoritmo e tamanho do caminho
encontrado também estão disponíveis na parte direita da tela.

## Outros 

Nenhuma dependência externa foi utilizada na implementação do projeto. Todo o
código foi escrito do zero por nós.

O livro [Mazes for Programmers](http://mazesforprogrammers.com) foi utilizado
como referência de algoritmos e visualização.

