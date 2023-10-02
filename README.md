# Quizner

Небольшой js-модуль (плагин), позволяющий подключить и настроить квиз или тест на сайт без jQuery.
Плюс данного модуля - в его гибкости. Модуль позволяет создать начиная от простых тестов, до многофункциональных квизов.
Вы можете создавать свои типы выбора данных или шаблоны отображения, подгружать форму в конце квиза с сохранением ответов и многое другое.

____

## Подключение

Для работы модуля, необходимо подключить CSS и JS файлы на ваш сайт

``` 
<link rel="stylesheet" href="css/quizner.min.css" />
```
``` 
<script src="js/quizner.min.js"></script>
```

После подключенного JS-файла вы можете использовать код инициализации квиза.

``` 
const Quiz = new Quizner({
  selector: '#quizner',
  init: {
    modal: false,
    btn: false,
  },
  questions: [
    {
      question: 'Вопрос?',
      type: 'radio',
      required: false,
      answers: [
        {
          name: 'Ответ 1',
          ball: 0
        },
        {
          name: 'Ответ 2',
          ball: 0
        },
      ],
    },
  ],
  results: [
    {
      ball: 0,
      title: 'Результат квиза',
    },
  ],
})

```
Для инициализации квиза на странице должен присуствовать элемент ``` <div id="quizner"></div> ```

Квиз будет инициализирован внутрь данного контейнера.

____

## Опции

### selector: `string` 
> default: `null`

Cелектор, указывающий место инициализации квиза. Не является обязательным в режиме модального окна.

### questions: `array` 
> default: `Array()`

Предполагает список вопросов и возможных ответов, состоящий из объектов.

*Пример вопроса*
```
{
  question: 'Вопрос?',
  type: 'radio',
  required: false,
  defaultBall: 0,
  answers: [
    {
      name: 'Ответ 1',
      ball: 0
    },
    {
      name: 'Ответ 2',
      ball: 0
    },
  ],
},
```
> `question` - заголовок вопроса

> `type` - тип вопроса (radio, checkbox)

> `required` - обязательность заполнения

> `answers` - массив, состоящий из объектов вопросов `{ name: string, ball: number }`

### results: `array`
> default: `Array()`

Предполагает список результатов, состоящий из объектов.

*Пример результата*
```
{
  title: 'Отображаемый результат',
  ball: 5,
},
```
> `title` - заголовок результата. Отображается по результатам квиза

> `ball` - необходимое кол-во баллов для достижения результата

____

### init: `object`
Настройки инициализации квиза.

#### modal: `boolean`
> default: `true`

Инициализирует квиз с модальное окном в конец `<body>`. Если значение `true`, то включается режим модального окна, в котором опция `selector` не является обязательной и не будет учтена. 

#### btn: `boolean`
> default: `false`

Правило отображения модального окна с квизом или только квиза. В режиме модального окна, если значение `true`, то модальное окно будет отображено при клике на кнопку, указанную в опции `btnSelector`.
Если режим модального окна выключен, то квиз аналогичным образом будет инициализирован при нажатии на указанную кнопку. В случае значения `false`, в режиме модального окна отображение возможно посредством методов модуля. 
При неустановленном режиме модального окна квиз будет отображен после инициализации кода.

#### btnSelector: `string`
> default: `null`

Селектор кнопки для отображения квиза, или его инициализации. Не является обязательным параметром, если значение опции `btn` равно `false`

____

### requiredField: `boolean`
> default: `true`

Обязательность заполнения всех вопросов. Если у вопросов опция `required` равна `false`, но при этом, опция `requiredField` равна `true`, то в случае отсутствия ответа на любой вопрос, будет отображено соответствующее предупреждение, 
с запретом к переходу к результатам.

### prefix: `string`
> default: `quizner`

Префикс ко всем классам элементов квиза.

### resultTextDefault: `string`
> default: `Вы не набрали достаточное количество баллов`

Стандартный заголовок результатов. Применяется, если заголовок не был указан в объектах массива опции `results`

### renderResults: ({Quizner: object, prefix: string, title: string, balls: string}) => ?string
> default: `null`

Позволяет создавать пользовательский результат. Опция принимает функцию, отвечающую за генерацию html кода результата. Callback-функция должна возвращать строку. 
Аргумент `prefix` - префикс шаблона, где `title` - заголовок результата из опции `results`, где `balls` - набранное количество баллов пользователем.

____

### modal: `object`
Опции для модального окна.

#### id: `string`
> default: `null`

Указывает, какой id должен быть у модального окна. По умолчанию `id` модального окна генерируется автоматически.

#### prefix: `string`
> default: `modal-quizner`

Префикс ко всем классам элементам модального окна.

#### classNameActive: `string`
> default: `modal-quizner--visible`

Класс, отвечающий за отображение модального окна.

#### renderModal: ({Quizner: object, quiz: string, prefix: string, htmlId: string}) => ?string
> default: `null`

Опция принимает функцию, отвечающую за генерацию html кода модального окна. Callback-функция должна возвращать строку. 
Аргумент `quiz` - является html-кодом квиза, где `prefix` - префикс модального окна, где `htmlId` - id модального окна.

____

### head: `object`
Опции для шапки квиза.

#### visible: `boolean`
> default: `true`

Отвечает за отображение шапки.

#### name: `string`
> default: `Квиз`

Отвечает за отображенное название квиза в шапке.

#### className: `string`
> default: `head`

Присваиваемый класс шапке с учетом префикса.

____

### footer: `object`
Опции для подвала квиза.

#### lastVisible: `boolean`
> default: `false`

Отвечает за отображение подвала после прохождения всех вопросов.

#### className: `string`
> default: `footer`

Присваиваемый класс подвалу с учетом префикса.

#### classNameHidden: `string`
> default: `footer--hidden`

Присваиваемый класс подвалу для его сокрытия с учетом префикса.

____

### navigation: `object`
Опции для навигации.

#### visible: `boolean`
> default: `true`

Отображение кнопок переключателей вопросами.

#### classNameButton: `string`
> default: `button`

Присваиваемый класс кнопок навигации с учетом префикса.

#### classNameButtonNext: `string`
> default: `button--next`

Присваиваемый класс кнопки навигации "следующий вопрос" с учетом префикса.

#### classNameButtonPrev: `string`
> default: `button--prev`

Присваиваемый класс кнопки навигации "предыдущий вопрос" с учетом префикса.

#### renderPrevButton: ({Quizner: object, className: string}) => ?string
> default: `null`

Позволяет создавать пользовательский код кнопки "предыдущий вопрос". Опция принимает функцию, отвечающую за генерацию html кода. Callback-функция должна возвращать строку. 
Аргумент `className` - класс кнопки.

#### renderNextButton: ({Quizner: object, className: string}) => ?string
> default: `null`

Позволяет создавать пользовательский код кнопки "следующий вопрос". Опция принимает функцию, отвечающую за генерацию html кода. Callback-функция должна возвращать строку. 
Аргумент `className` - класс кнопки.

____

### warning: `object`
Опции для элементов пользовательских предупреждений.

#### text: `string`
> default: `Для получения результата, необходимо ответить на все вопросы`

Отвечает за текст отображения предупреждения, если значение опции `requiredField` равна `true`

#### textRequired: `string`
> default: `Для перехода к следующиму вопросу, ответье на текущий`

Отвечает за текст отображения предупреждения, если значение опции объекта вопроса `required` равна `true`

#### className: `string`
> default: `warning`

Присваиваемый класс элементу ошибки с учетом префикса.

#### classNameActive: `string`
> default: `warning--active`

Присваиваемый класс отображения ошибки элементу ошибки с учетом префикса.

____

### pagination: `object`
Опции для пагинации.

#### visible: `boolean`
> default: `true`

Отображение пагинации.

#### className: `string`
> default: `quizner-stages`

Присваиваемый класс контейнеру пагинации с учетом префикса.

#### classNameBullet: `string`
> default: `stage`

Присваиваемый класс элементу пагинации с учетом префикса.

#### classNameBulletActive: `string`
> default: `stage--active`

Присваиваемый класс отображения элементу пагинации с учетом префикса.

#### classNameText: `string`
> default: `text`

Присваиваемый класс элементу текста пагинации с учетом префикса.

____

### types: `array`
> default: `Array()`

Предполагает список типов вопросов, состоящий из объектов. Тип вопроса предполагает способ выбора: radio, checkbox. 
Указывается имя вопроса (опция `name`) в объектах вопросов посредством опции `type` в массиве `questions`. 
Данная опция позволяет создать пользовательский тип вопроса.


*Пример объекта типа вопроса*
```
{
  name: 'custom_name',
  prefix: true,
  className: 'type-prefix',
  render: () => "",
},
```

> `name` - наименование типа вопроса

> `prefix` - необходимость добавления префикса контейнеру

> `className` - присваиваемый класс контейнеру типа вопроса при отображении

> `render: ({Quizner: object, prefix: string, idQuestion: number, value: string, name: string, isChecked: boolean}) => ?string` - отвечает за генерацию html кода типа вопроса. Callback-функция должна возвращать строку. 
> > Аргумент `prefix` - является классом, указанным префиксом в опциях данного типа. Где `idQuestion` - индекс вопроса, где `value` - значение для input, где name - значение для input, isChecked - атрибут checked у input элемента.

____

### templates: `array`
> default: `Array()`

Предполагает список шаблонов, состоящий из объектов. По умолчанию два шаблона отображения: `selects`, `results`. 
Шаблон выполняет функцию отображения внутри себя какого-либо контента. Например, результат квиза, или рекламный блок между вопросами. 
С помощью методов и событий модуля вы можете переключать шаблоны, обеспечивая гибкость квизу. 
Данная опция позволяет создать пользовательский шаблон.

*Пример объекта шаблона*
```
{
  name: 'custom_template',
  className: 'type-template',
  render: () => "",
},
```

> `name` - наименование шаблона

> `className` - присваиваемый класс контейнеру шаблона при отображении

> `render: ({Quizner: object, className: string}) => ?string` - отвечает за генерацию html кода шаблона. Callback-функция должна возвращать строку. 
> > Аргумент `className` - указанный класс в опциях шаблона.

____

## Методы

### Quizner.restart() => `boolean`
Перезапускает квиз, начиная с стартового шаблона и первого вопроса. Функция не будет выполнена, если квиз не был инициализирован или был разрушен посредством функции `destroy()`

### Quizner.destroy() => `boolean`
Разрушает все события, обнуляет состояния, удаляет из html контейнер квиза или модальное окно с квизом

### Quizner.init() => `boolean`
Принудительно инициализирует квиз. Если квиз уже инициализирован, функция не будет выполнена

### Quizner.saveStateQuestions() => `boolean`
Сохраняет состояние выбранных ответов текущего вопроса

### Quizner.getStateQuestionAnswer(name: `string`) => `array, boolean`
Возвращает объект состояния варианта ответа по имени вопроса. Принимает `name` - имя вопроса.

### Quizner.saveStateQuestions() => `boolean`
Сохраняет состояние выбранных ответов текущего вопроса

### Quizner.isStateAnswerResults() => `boolean`
Проверяет наличие результатов, возвращает `true`, если результаты найдены.

### Quizner.isStateQuestionAnswer(id: `number`) => `boolean`
Проверяет наличие результатов указанного вопроса по его id. Принимает `id` - индекс вопроса.

### Quizner.getStateQuestionSelected(id: `number`) => `boolean`
Возвращает массив объектов выбранных ответов у вопроса по id. Принимает `id` - индекс вопроса.

### Quizner.calcResultsBall() => `number, boolean`
Функция подсчета баллов. Если обязательные опции не установлены для вопросов или квиза, то при отсуствии выбранных полей, значение балла у вопроса будет задано по умолчанию `0` или `defaultBall` у вопроса.
Возвращает число в виде набранного количества баллов на момент вызова.

### Quizner.calcMaxBalls() => `number, boolean`
Функция подсчета максимального количества баллов. Возвращает число в виде максимального количества баллов.

### Quizner.calcCompareBall(ball: number) => `object, null, boolean`
Функция сравнения количества баллов в диапазоне с возможными указанными в результатах баллами. 
Возвращает объект результата, если таковой был найден. Возвращает `null`, если результат не найден. 

### Quizner.withHtmlTypeAnswers(render: function, props: object) => `string`
Вспомогательная HoC функция реализации логики типов вопросов. 
Используйте функцию конечным результатом для Callback-функции свойством объекта типа вопроса `render`.

`render({Quizner: object, prefix: string, idQuestion: number, value: string, name: string, isChecked: boolean}) => string` - отвечает за генерацию html кода типа вопроса. Callback-функция должна возвращать строку. 
> Аргумент `prefix` - является классом, указанным префиксом в опциях данного типа. Где `idQuestion` - индекс вопроса, где `value` - значение для input, где name - значение для input, isChecked - атрибут checked у input элемента.

`props { name, ball, prefix, index, number }`
> `name` - наименование вопроса. `ball` - количество баллов. `prefix` - класс-префикс квиза. `index` - индекс ответа.  `number` - индекс вопроса. 

### Quizner.getSelectedAnswers() => `object, boolean`
Получение всех выбранных ответов текущего вопроса. Возвращает объект с массивом `{ answers: [] }` текущих выбранных ответов данного вопроса.

### Quizner.getSelectedAnswers(value: string) => `string, boolean`
Приведение значения к развернутому формату. Принимает `value` - значение вида `индекс вопроса`-`индекс ответа`-`количество баллов за ответ`. Возвращает объект вида `{ questionId, answerId, ball }`

### Quizner.setWarning(state: boolean, content: string) => `boolean`
Управляет отображением элементов предупреждения и его содержимым. Где `state` - отображение/сокрытие предупреждения. Где `content` - сообщение предупреждения.

### Quizner.setModal(state: boolean) => `boolean`
Управляет отображением модального окна. Где `state` - отображение/сокрытие модального окна.

### Quizner.setHiddenFooter(state: boolean) => `boolean`
Управляет отображением подвала квиза. Где `state` - отображение/сокрытие подвала.

### Quizner.setPaginationText(id: number) => `boolean`
Управляет текстом шагов в пагинации. Где `id` - номер шага.

### Quizner.setPaginationBullets(id: number) => `boolean`
Управляет активностью шагов элементам пагинации. Устанавливает активный класс включительно до указанного элемента. Где `id` - номер шага.

### Quizner.setQuestion(id: number) => `boolean`
Устанавливает активный вопрос по индексу. Где `id` - индекс вопроса.

### Quizner.setPositionQuestion(action: string) => `boolean`
Управление переключением состояния относительно текущего вопроса к предыдущему или следующему. Аргумент `action` принимает два значения: `next`, `prev`.
Если передано значение `next`, то будет установлен следующий вопрос учитывая опции вопроса и квиза. Аналогично, если передано значение `prev`, то будет установлен предыдущий вопрос.

### Quizner.isRequiredQuestion(id: number) => `boolean`
Проверяет на обязательность вопроса по id. Где `id` - индекс вопроса.

### Quizner.getQuestionTypeObject(name: string) => `object, undefined, boolean`
Возвращает объект типа вопроса по его имени. Где `name` - имя типа вопроса.
Если вопрос не найден, функция вернет `undefined`.

### Quizner.getQuestionDefaultBall(id: number) => `number, boolean`
Возвращает балл вопроса по умолчанию по id. Где `id` - индекс вопроса.

### Quizner.getAnswerTypes() => `array, boolean`
Возвращает массив всех типов вопросов.

### Quizner.setTemplate(name: string) => `boolean`
Устанавливает шаблон по его имени. Где `name` - имя шаблона.

### Quizner.getTemplate() => `object`
Возвращает текущий шаблон и его индекс в виде объекта `{ current, index }`

### Quizner.getTemplates() => `array, boolean`
Возвращает массив всех шаблонов.

### Quizner.isCurrentTemplate(name: string) => `boolean`
Функция проверяет, установлен в момент вызова указанный шаблон по его имени. Где `name` - имя шаблона.

Методы `restart(), destroy(), saveStateQuestions(), getStateQuestionAnswer(name), isStateAnswerResults(), isStateQuestionAnswer(id), getStateQuestionSelected(id), calcResultsBall(), calcMaxBalls(), calcCompareBall(ball), getSelectedAnswers(), formatValue(value),
setWarning(state, content), setModal(state), setHiddenFooter(state), setPaginationText(id), setPaginationBullets(id), setQuestion(id), setPositionQuestion(action), getQuestionTypeObject(name), getQuestionDefaultBall(id), getAnswerTypes(), getTemplates(), ` 
вернут `false` если квиз не был инициализирован в момент вызова метода.
